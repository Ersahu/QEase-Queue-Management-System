const express = require('express');
const router = express.Router();
const {
  getAllQueues,
  getQueueById,
  createQueue,
  updateQueueSettings,
} = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware');
const { predictWaitTime, getQueueStatistics } = require('../utils/waitTimePredictor');
const QueueEntry = require('../models/QueueEntry');

/**
 * @desc    Get predicted wait time for current user in a queue
 * @route   GET /api/queues/:id/wait-time
 * @access  Private
 */
const getMyWaitTime = async (req, res) => {
  try {
    const queueId = req.params.id;

    // Find user's entry in this queue
    const entry = await QueueEntry.findOne({
      queue: queueId,
      user: req.user._id,
      status: { $in: ['waiting', 'called'] },
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'You are not in this queue',
      });
    }

    // Get AI-powered prediction
    const prediction = await predictWaitTime(queueId, entry.position);

    if (!prediction.success) {
      return res.status(500).json(prediction);
    }

    res.json({
      success: true,
      data: {
        position: entry.position,
        predictedWaitTime: prediction.predictedWaitTime,
        avgServiceTime: prediction.avgServiceTime,
        confidence: prediction.confidence,
        factors: prediction.factors,
        joinedAt: entry.joinedAt,
        estimatedCompletionTime: new Date(
          Date.now() + prediction.predictedWaitTime * 60 * 1000
        ),
      },
    });
  } catch (error) {
    console.error('Get wait time error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get queue statistics and analytics
 * @route   GET /api/queues/:id/stats
 * @access  Public
 */
const getQueueStats = async (req, res) => {
  try {
    const queueId = req.params.id;

    const stats = await getQueueStatistics(queueId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get queue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

router.get('/:id/wait-time', protect, getMyWaitTime);
router.get('/:id/stats', getQueueStats);

// Public routes
router.get('/', getAllQueues);
router.get('/:id', getQueueById);

// Admin routes
router.post('/admin/queues', protect, createQueue);
router.put('/admin/queues/:id/settings', protect, updateQueueSettings);

module.exports = router;
