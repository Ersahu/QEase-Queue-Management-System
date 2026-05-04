const Queue = require('../models/Queue');
const QueueEntry = require('../models/QueueEntry');

/**
 * @desc    Get all active queues
 * @route   GET /api/queues
 * @access  Public
 */
const getAllQueues = async (req, res) => {
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
    console.error('Get all queues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single queue by ID
 * @route   GET /api/queues/:id
 * @access  Public
 */
const getQueueById = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id).populate(
      'admin',
      'name email'
    );

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found',
      });
    }

    const waitingCount = await QueueEntry.countDocuments({
      queue: queue._id,
      status: 'waiting',
    });

    res.json({
      success: true,
      data: {
        ...queue.toObject(),
        waitingCount,
      },
    });
  } catch (error) {
    console.error('Get queue by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new queue (Admin only)
 * @route   POST /api/admin/queues
 * @access  Private/Admin
 */
const createQueue = async (req, res) => {
  try {
    const { name, description, avgServiceTime, serviceType, location } = req.body;

    const parsedLocation = location?.coordinates?.length === 2
      ? {
          type: 'Point',
          coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
          address: location.address || '',
          city: location.city || '',
        }
      : undefined;

    const queue = await Queue.create({
      name,
      description,
      admin: req.user._id,
      avgServiceTime: avgServiceTime || 5,
      serviceType: serviceType || 'other',
      ...(parsedLocation && { location: parsedLocation }),
    });

    const populatedQueue = await Queue.findById(queue._id).populate(
      'admin',
      'name email'
    );

    res.status(201).json({
      success: true,
      message: 'Queue created successfully',
      data: populatedQueue,
    });
  } catch (error) {
    console.error('Create queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Update queue settings (Admin only)
 * @route   PUT /api/admin/queues/:id/settings
 * @access  Private/Admin
 */
const updateQueueSettings = async (req, res) => {
  try {
    const { name, description, avgServiceTime, isActive, isPaused } = req.body;

    let queue = await Queue.findById(req.params.id);

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
        message: 'Not authorized to update this queue',
      });
    }

    queue = await Queue.findByIdAndUpdate(
      req.params.id,
      {
        name: name || queue.name,
        description: description !== undefined ? description : queue.description,
        avgServiceTime: avgServiceTime || queue.avgServiceTime,
        isActive: isActive !== undefined ? isActive : queue.isActive,
        isPaused: isPaused !== undefined ? isPaused : queue.isPaused,
      },
      { new: true, runValidators: true }
    ).populate('admin', 'name email');

    res.json({
      success: true,
      message: 'Queue updated successfully',
      data: queue,
    });
  } catch (error) {
    console.error('Update queue settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getAllQueues,
  getQueueById,
  createQueue,
  updateQueueSettings,
};
