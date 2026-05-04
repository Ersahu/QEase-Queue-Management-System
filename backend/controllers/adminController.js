const Queue = require('../models/Queue');
const QueueEntry = require('../models/QueueEntry');
const { updateActualServiceTime } = require('../utils/waitTimePredictor');
const {
  recalculateQueuePositionsAndNotify,
  notifyQueuePausedResumed,
} = require('../services/realtimeQueueService');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboard = async (req, res) => {
  try {
    // Get all queues managed by this admin
    const queues = await Queue.find({ admin: req.user._id });

    const queueStats = await Promise.all(
      queues.map(async (queue) => {
        const waitingCount = await QueueEntry.countDocuments({
          queue: queue._id,
          status: 'waiting',
        });

        const calledCount = await QueueEntry.countDocuments({
          queue: queue._id,
          status: 'called',
        });

        const completedToday = await QueueEntry.countDocuments({
          queue: queue._id,
          status: 'completed',
          completedAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        });

        return {
          queueId: queue._id,
          name: queue.name,
          waitingCount,
          calledCount,
          completedToday,
          avgServiceTime: queue.avgServiceTime,
          totalServed: queue.totalServed,
          isPaused: queue.isPaused,
          isActive: queue.isActive,
        };
      })
    );

    const totalWaiting = queueStats.reduce((sum, q) => sum + q.waitingCount, 0);
    const totalCalled = queueStats.reduce((sum, q) => sum + q.calledCount, 0);
    const totalCompletedToday = queueStats.reduce(
      (sum, q) => sum + q.completedToday,
      0
    );

    res.json({
      success: true,
      data: {
        queues: queueStats,
        summary: {
          totalQueues: queues.length,
          totalWaiting,
          totalCalled,
          totalCompletedToday,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Call next customer in queue
 * @route   POST /api/admin/queues/:id/call-next
 * @access  Private/Admin
 */
const callNextCustomer = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }

    // Check if user is the admin of this queue
    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this queue',
      });
    }

    if (queue.isPaused) {
      return res.status(400).json({
        success: false,
        message: 'Queue is paused. Resume it first.',
      });
    }

    // Get the first waiting customer
    const nextEntry = await QueueEntry.findOne({
      queue: queue._id,
      status: 'waiting',
    })
      .sort({ position: 1 })
      .populate('user', 'name email phone');

    if (!nextEntry) {
      return res.json({
        success: true,
        message: 'No customers waiting in queue',
        data: null,
      });
    }

    // Update status to called
    nextEntry.status = 'called';
    await nextEntry.save();

    // Recalculate positions for remaining customers and trigger notifications
    const waitingEntries = await recalculateQueuePositionsAndNotify(
      queue,
      req.io,
      'next_customer_called'
    );

    // Emit socket events
    if (req.io) {
      // Notify the called customer
      req.io.to(`user_${nextEntry.user._id}`).emit('customerCalled', {
        entryId: nextEntry._id,
        queueName: queue.name,
        message: 'You are now being called!',
      });

      // Update all users in the queue
      req.io.to(`queue_${queue._id}`).emit('queueUpdated', {
        queueId: queue._id,
        action: 'called',
        calledEntry: nextEntry,
        updatedPositions: waitingEntries.map((e) => ({
          entryId: e._id,
          userId: e.user._id,
          position: e.position,
          estimatedWaitTime: e.estimatedWaitTime,
        })),
      });
    }

    res.json({
      success: true,
      message: 'Next customer called successfully',
      data: nextEntry,
    });
  } catch (error) {
    console.error('Call next customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark customer as completed
 * @route   POST /api/admin/queues/:id/complete/:entryId
 * @access  Private/Admin
 */
const completeCustomer = async (req, res) => {
  try {
    const entry = await QueueEntry.findById(req.params.entryId)
      .populate('queue')
      .populate('user', 'name email');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found',
      });
    }

    // Check authorization
    if (entry.queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Update status to completed
    entry.status = 'completed';
    await entry.save();

    // Calculate and store actual service time (AI enhancement)
    await updateActualServiceTime(entry);

    // Update queue stats
    const queue = await Queue.findById(entry.queue._id);
    queue.totalServed += 1;
    await queue.save();

    // Emit socket event
    if (req.io) {
      req.io.to(`queue_${queue._id}`).emit('queueUpdated', {
        queueId: queue._id,
        action: 'completed',
        entryId: entry._id,
      });
    }

    res.json({
      success: true,
      message: 'Customer marked as completed',
    });
  } catch (error) {
    console.error('Complete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Pause a queue
 * @route   POST /api/admin/queues/:id/pause
 * @access  Private/Admin
 */
const pauseQueue = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }

    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    queue.isPaused = true;
    await queue.save();
    await notifyQueuePausedResumed(queue, req.io, true);

    // Emit socket event
    if (req.io) {
      req.io.to(`queue_${queue._id}`).emit('queuePaused', {
        queueId: queue._id,
        message: 'Queue has been paused',
      });
    }

    res.json({
      success: true,
      message: 'Queue paused successfully',
      data: queue,
    });
  } catch (error) {
    console.error('Pause queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Resume a queue
 * @route   POST /api/admin/queues/:id/resume
 * @access  Private/Admin
 */
const resumeQueue = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }

    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    queue.isPaused = false;
    await queue.save();
    await notifyQueuePausedResumed(queue, req.io, false);

    // Emit socket event
    if (req.io) {
      req.io.to(`queue_${queue._id}`).emit('queueResumed', {
        queueId: queue._id,
        message: 'Queue has been resumed',
      });
    }

    res.json({
      success: true,
      message: 'Queue resumed successfully',
      data: queue,
    });
  } catch (error) {
    console.error('Resume queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Remove customer from queue
 * @route   DELETE /api/admin/queues/:queueId/customers/:entryId
 * @access  Private/Admin
 */
const removeCustomer = async (req, res) => {
  try {
    const entry = await QueueEntry.findById(req.params.entryId).populate(
      'queue'
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found',
      });
    }

    if (entry.queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Update status to cancelled
    entry.status = 'cancelled';
    await entry.save();

    // Recalculate positions and trigger position change notifications
    const waitingEntries = await recalculateQueuePositionsAndNotify(
      entry.queue,
      req.io,
      'customer_removed'
    );

    // Emit socket event
    if (req.io) {
      req.io.to(`queue_${entry.queue._id}`).emit('queueUpdated', {
        queueId: entry.queue._id,
        action: 'removed',
        entryId: entry._id,
        updatedPositions: waitingEntries.map((e) => ({
          entryId: e._id,
          userId: e.user._id,
          position: e.position,
          estimatedWaitTime: e.estimatedWaitTime,
        })),
      });
    }

    res.json({
      success: true,
      message: 'Customer removed from queue',
    });
  } catch (error) {
    console.error('Remove customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get customers in a queue
 * @route   GET /api/admin/queues/:id/customers
 * @access  Private/Admin
 */
const getQueueCustomers = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }

    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const entries = await QueueEntry.find({
      queue: queue._id,
      status: { $in: ['waiting', 'called'] },
    })
      .populate('user', 'name email phone')
      .sort({ position: 1 });

    res.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error('Get queue customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a queue
 * @route   DELETE /api/admin/queues/:id
 * @access  Private/Admin
 */
const deleteQueue = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }

    // Check if user is the admin of this queue
    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this queue',
      });
    }

    // Check if there are active customers in the queue
    const activeEntries = await QueueEntry.countDocuments({
      queue: queue._id,
      status: { $in: ['waiting', 'called'] },
    });

    if (activeEntries > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete queue with ${activeEntries} active customer(s). Please remove or complete them first.`,
      });
    }

    // Delete all queue entries (history)
    await QueueEntry.deleteMany({ queue: queue._id });

    // Delete the queue
    await Queue.findByIdAndDelete(queue._id);

    // Emit socket event
    if (req.io) {
      req.io.to(`queue_${queue._id}`).emit('queueDeleted', {
        queueId: queue._id,
        message: 'This queue has been deleted',
      });
    }

    res.json({
      success: true,
      message: 'Queue deleted successfully',
    });
  } catch (error) {
    console.error('Delete queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  callNextCustomer,
  completeCustomer,
  pauseQueue,
  resumeQueue,
  removeCustomer,
  getQueueCustomers,
  deleteQueue,
};