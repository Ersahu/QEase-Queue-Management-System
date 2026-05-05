const Queue = require('../models/Queue');
const QueueEntry = require('../models/QueueEntry');
const { joinQueueWithToken, getQueueStatus, serializeEntry } = require('../services/tokenService');

const createToken = async (req, res) => {
  try {
    const { queueId, name, phone, serviceType } = req.body;

    if (!queueId) {
      return res.status(400).json({ success: false, message: 'Queue ID is required' });
    }

    const result = await joinQueueWithToken({
      queueId,
      name,
      phone,
      serviceType,
      io: req.io,
    });

    if (!result.success) {
      return res.status(result.statusCode).json(result);
    }

    const status = await getQueueStatus(queueId, { _id: result.data.id });

    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: {
        token: result.data,
        status,
      },
    });
  } catch (error) {
    console.error('Create token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create token',
      error: error.message,
    });
  }
};

const getTokenStatus = async (req, res) => {
  try {
    const entry = await QueueEntry.findById(req.params.entryId)
      .populate('queue', 'name avgServiceTime serviceType')
      .populate('user', 'name email phone')
      .select('+customerPhoneEncrypted');

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    const status = await getQueueStatus(entry.queue._id, entry);

    return res.json({
      success: true,
      data: {
        token: serializeEntry(entry),
        status,
      },
    });
  } catch (error) {
    console.error('Get token status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load token status',
      error: error.message,
    });
  }
};

const getPublicQueueStatus = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.queueId);
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    const status = await getQueueStatus(queue._id);

    return res.json({
      success: true,
      data: {
        queue: {
          id: queue._id,
          name: queue.name,
          serviceType: queue.serviceType,
          avgServiceTime: queue.avgServiceTime,
          isPaused: queue.isPaused,
        },
        status,
      },
    });
  } catch (error) {
    console.error('Get public queue status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load queue status',
      error: error.message,
    });
  }
};

module.exports = {
  createToken,
  getTokenStatus,
  getPublicQueueStatus,
};
