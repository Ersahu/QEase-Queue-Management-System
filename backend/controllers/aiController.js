/**
 * AI Controller
 * Handles all AI-powered features
 */

const { predict, trainModel, getTimeRecommendation } = require('../utils/mlPredictor');
const { predictWaitTime } = require('../utils/waitTimePredictor');
const notificationService = require('../services/notificationService');
const chatbotService = require('../services/chatbotService');
const locationService = require('../services/locationService');
const QueueEntry = require('../models/QueueEntry');
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
  chatbotMessage,
  getChatHistory,
  recommendTime,
  trainMLModel,
  updateLocation,
};
