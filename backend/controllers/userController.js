const Queue = require('../models/Queue');
const QueueEntry = require('../models/QueueEntry');
const { predictWaitTime } = require('../utils/waitTimePredictor');
const { recalculateQueuePositionsAndNotify } = require('../services/realtimeQueueService');
const { joinQueueForUser } = require('../services/queueJoinService');

const VALID_JOIN_SOURCES = ['app', 'self-service', 'kiosk', 'api'];

/**
 * @desc    Get all active queues for user
 * @route   GET /api/users/queues
 * @access  Private
 */
const getUserQueues = async (req, res) => {
  try {
    const queues = await Queue.find({ isActive: true })
      .populate('admin', 'name email')
      .sort({ createdAt: -1 });

    // Get waiting count for each queue
    const queuesWithStats = await Promise.all(
      queues.map(async (queue) => {
        const waitingCount = await QueueEntry.countDocuments({
          queue: queue._id,
          status: 'waiting',
        });

        return {
          ...queue.toObject(),
          waitingCount,
        };
      })
    );

    res.json({
      success: true,
      count: queuesWithStats.length,
      data: queuesWithStats,
    });
  } catch (error) {
    console.error('Get user queues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get nearby queues using geospatial search
 * @route   GET /api/users/queues/nearby
 * @access  Private
 */
const getNearbyQueues = async (req, res) => {
  try {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);
    const radiusKm = Number(req.query.radiusKm || 5);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query params are required',
      });
    }

    const nearbyQueues = await Queue.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'distanceMeters',
          maxDistance: radiusKm * 1000,
          spherical: true,
          query: { isActive: true },
        },
      },
      { $sort: { distanceMeters: 1 } },
      { $limit: 50 },
    ]);

    const queueIds = nearbyQueues.map((queue) => queue._id);
    const waitingCounts = await QueueEntry.aggregate([
      {
        $match: {
          queue: { $in: queueIds },
          status: 'waiting',
        },
      },
      {
        $group: {
          _id: '$queue',
          waitingCount: { $sum: 1 },
        },
      },
    ]);

    const waitingMap = new Map(
      waitingCounts.map((item) => [item._id.toString(), item.waitingCount])
    );

    res.json({
      success: true,
      count: nearbyQueues.length,
      data: nearbyQueues.map((queue) => ({
        ...queue,
        waitingCount: waitingMap.get(queue._id.toString()) || 0,
        distanceKm: Number((queue.distanceMeters / 1000).toFixed(2)),
      })),
    });
  } catch (error) {
    console.error('Get nearby queues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby queues',
      error: error.message,
    });
  }
};

/**
 * @desc    Join a queue
 * @route   POST /api/users/queues/:id/join
 * @access  Private
 */
const joinQueue = async (req, res) => {
  try {
    const result = await joinQueueForUser({
      queueId: req.params.id,
      userId: req.user._id,
      io: req.io,
      source: 'app',
    });

    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
        ...(result.data && { data: result.data }),
      });
    }

    res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error('Join queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Leave a queue
 * @route   DELETE /api/users/queues/:id/leave
 * @access  Private
 */
const leaveQueue = async (req, res) => {
  try {
    const entry = await QueueEntry.findOne({
      queue: req.params.id,
      user: req.user._id,
      status: { $in: ['waiting', 'called'] },
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'You are not in this queue',
      });
    }

    // Update status to cancelled
    entry.status = 'cancelled';
    if (!VALID_JOIN_SOURCES.includes(entry.joinSource)) {
      entry.joinSource = 'app';
    }
    await entry.save();

    // Recalculate positions for remaining users
    const queue = await Queue.findById(entry.queue);
    if (queue) {
      await recalculateQueuePositionsAndNotify(queue, req.io, 'user_left_queue');
    }

    // Emit socket event
    if (req.io) {
      req.io.to(`queue_${entry.queue}`).emit('queueUpdated', {
        queueId: entry.queue,
        action: 'left',
        entryId: entry._id,
      });
    }

    res.json({
      success: true,
      message: 'Successfully left the queue',
    });
  } catch (error) {
    console.error('Leave queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's current queue position
 * @route   GET /api/users/my-position
 * @access  Private
 */
const getMyPosition = async (req, res) => {
  try {
    const entry = await QueueEntry.findOne({
      user: req.user._id,
      status: { $in: ['waiting', 'called'] },
    })
      .populate('queue', 'name avgServiceTime isPaused')
      .populate('user', 'name email');

    if (!entry) {
      return res.json({
        success: true,
        data: null,
        message: 'Not currently in any queue',
      });
    }

    // Recalculate estimated wait time using AI prediction
    const prediction = await predictWaitTime(entry.queue._id, entry.position);
    const updatedWaitTime = prediction.success ? prediction.predictedWaitTime : 0;

    if (updatedWaitTime !== entry.estimatedWaitTime) {
      entry.estimatedWaitTime = updatedWaitTime;
      await entry.save();
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Get my position error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's queue history
 * @route   GET /api/users/history
 * @access  Private
 */
const getQueueHistory = async (req, res) => {
  try {
    const entries = await QueueEntry.find({
      user: req.user._id,
      status: { $in: ['completed', 'cancelled'] },
    })
      .populate('queue', 'name')
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error('Get queue history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getUserQueues,
  getNearbyQueues,
  joinQueue,
  leaveQueue,
  getMyPosition,
  getQueueHistory,
};
