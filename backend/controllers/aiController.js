/**
 * AI Controller
 * Handles all AI-powered features
 */

const { predict, trainModel, getTimeRecommendation } = require('../utils/mlPredictor');
const { predictWaitTime } = require('../utils/waitTimePredictor');
const notificationService = require('../services/notificationService');
const qrService = require('../services/qrService');
const chatbotService = require('../services/chatbotService');
const locationService = require('../services/locationService');
const QueueEntry = require('../models/QueueEntry');
const Queue = require('../models/Queue');
const User = require('../models/User');

/**
 * @desc    Get AI-powered wait time prediction
 * @route   POST /api/ai/predict-wait-time
 * @access  Private
 */
const getWaitTimePrediction = async (req, res) => {
  try {
    const { queueId, position } = req.body;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: 'Queue ID is required',
      });
    }

    // If position not provided, find user's current position
    let userPosition = position;
    if (!userPosition) {
      const entry = await QueueEntry.findOne({
        queue: queueId,
        user: req.user._id,
        status: { $in: ['waiting', 'called'] },
      });

      if (entry) {
        userPosition = entry.position;
      }
    }

    if (!userPosition) {
      return res.status(400).json({
        success: false,
        message: 'Position is required or user must be in the queue',
      });
    }

    // Get prediction
    const prediction = await predictWaitTime(queueId, userPosition);

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    console.error('Get wait time prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Send notification to user
 * @route   POST /api/ai/notify-user
 * @access  Private
 */
const notifyUser = async (req, res) => {
  try {
    const { userId, type, eventType } = req.body;

    if (!userId || !type) {
      return res.status(400).json({
        success: false,
        message: 'User ID and notification type are required',
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find user's active queue entry
    const entry = await QueueEntry.findOne({
      user: userId,
      status: { $in: ['waiting', 'called'] },
    }).populate('queue');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'No active queue entry found',
      });
    }

    // Send notification based on type
    let result;
    if (type === 'join' || eventType === 'join') {
      result = await notificationService.sendJoinNotification(user, entry.queue, entry);
    } else if (type === 'near-turn' || eventType === 'near-turn') {
      result = await notificationService.sendNearTurnNotification(user, entry.queue, entry.position);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Notify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Generate QR code for queue entry
 * @route   POST /api/ai/generate-qr
 * @access  Private
 */
const generateQR = async (req, res) => {
  try {
    const { entryId } = req.body;

    if (!entryId) {
      return res.status(400).json({
        success: false,
        message: 'Entry ID is required',
      });
    }

    const result = await qrService.generateQRCode(entryId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's QR code
 * @route   GET /api/ai/my-qr
 * @access  Private
 */
const getMyQR = async (req, res) => {
  try {
    const result = await qrService.getUserQRCode(req.user._id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get my QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Scan and validate QR code
 * @route   POST /api/ai/scan-qr
 * @access  Private
 */
const scanQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required',
      });
    }

    const result = await qrService.validateQRCode(qrData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Scan QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Check-in customer by scanning admin QR code
 * @route   POST /api/ai/checkin-admin-qr
 * @access  Private
 */
const checkinAdminQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required',
      });
    }

    // Decode QR data
    let decodedData;
    try {
      decodedData = JSON.parse(Buffer.from(qrData, 'base64').toString('utf8'));
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format',
      });
    }

    // Validate it's an admin QR
    if (decodedData.type !== 'ADMIN_QR') {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code type',
      });
    }

    const { queueId, queueName, adminId } = decodedData;

    const queue = await Queue.findById(queueId);
    if (!queue || !queue.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Queue is not available for check-in',
      });
    }

    if (queue.admin.toString() !== adminId) {
      return res.status(400).json({
        success: false,
        message: 'QR code does not match this queue admin',
      });
    }

    // Find customer's active entry in this queue
    const entry = await QueueEntry.findOne({
      queue: queueId,
      user: req.user._id,
      status: { $in: ['waiting', 'called'] },
    })
      .populate('queue')
      .populate('user', 'name email phone');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'You are not in this queue or your entry is not active',
      });
    }

    // Check if already checked in
    if (entry.checkedIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in',
        checkedInAt: entry.checkedInAt,
      });
    }

    // Mark as checked in
    entry.checkedIn = true;
    entry.checkedInAt = new Date();
    await entry.save();

    const arrivalDetails = {
      id: entry._id,
      queueId: entry.queue._id,
      position: entry.position,
      status: entry.status,
      queue: entry.queue.name,
      joinedAt: entry.joinedAt,
      checkedInAt: entry.checkedInAt,
      estimatedWaitTime: entry.estimatedWaitTime,
      user: {
        id: entry.user._id,
        name: entry.user.name,
        email: entry.user.email,
        phone: entry.user.phone,
      },
    };

    // Emit socket event to notify admin
    const io = req.app.get('io');
    if (io) {
      io.to(`queue_${queueId}`).emit('customer:checkin', {
        queueId,
        entry: arrivalDetails,
        message: `${entry.user.name} has checked in for ${queueName}`,
      });
    }

    res.json({
      success: true,
      message: `Successfully checked in to ${queueName}`,
      data: {
        entry: arrivalDetails,
        queueInfo: {
          queueId,
          queueName,
          adminId,
        },
      },
    });
  } catch (error) {
    console.error('Admin QR check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Chatbot message handler
 * @route   POST /api/ai/chatbot
 * @access  Private
 */
const chatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const result = await chatbotService.processMessage(req.user._id, message);

    res.json(result);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get chat history
 * @route   GET /api/ai/chat-history
 * @access  Private
 */
const getChatHistory = async (req, res) => {
  try {
    const result = await chatbotService.getChatHistory(req.user._id);

    res.json(result);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get time recommendations for a queue
 * @route   GET /api/ai/recommend-time/:queueId
 * @access  Private
 */
const recommendTime = async (req, res) => {
  try {
    const { queueId } = req.params;

    const result = await locationService.getTimeRecommendations(queueId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Recommend time error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Train ML model for a queue
 * @route   POST /api/ai/train-model/:queueId
 * @access  Private/Admin
 */
const trainMLModel = async (req, res) => {
  try {
    const { queueId } = req.params;

    const result = await trainModel(queueId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Train model error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Update user location
 * @route   POST /api/ai/location
 * @access  Private
 */
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const result = await locationService.updateUserLocation(req.user._id, {
      latitude,
      longitude,
    });

    res.json(result);
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getWaitTimePrediction,
  notifyUser,
  generateQR,
  getMyQR,
  scanQR,
  checkinAdminQR,
  chatbotMessage,
  getChatHistory,
  recommendTime,
  trainMLModel,
  updateLocation,
};
