const jwt = require('jsonwebtoken');
const Queue = require('../models/Queue');
const { joinQueueForUser } = require('../services/queueJoinService');

const getQrSecret = () => process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET;
const getQrExpiry = () => process.env.QR_TOKEN_EXPIRY || '12h';

const createQueueJoinToken = (queue) =>
  jwt.sign(
    { type: 'queue_join', queueId: queue._id.toString(), adminId: queue.admin.toString() },
    getQrSecret(),
    { expiresIn: getQrExpiry() }
  );

const buildQueueJoinData = (queue) => {
  const token = createQueueJoinToken(queue);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  return {
    queueId: queue._id,
    queueName: queue.name,
    token,
    joinUrl: `${frontendUrl}/qr-join/${token}`,
    expiresIn: getQrExpiry(),
  };
};

const encodeQrPayload = (payload) =>
  Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');

const buildAdminCheckinData = (queue) => {
  const payload = {
    type: 'ADMIN_QR',
    queueId: queue._id.toString(),
    queueName: queue.name,
    adminId: queue.admin.toString(),
    generatedAt: new Date().toISOString(),
  };

  return {
    queueId: queue._id,
    queueName: queue.name,
    qrData: encodeQrPayload(payload),
    payload,
  };
};

const verifyQueueJoinToken = (token) => {
  try {
    return { valid: true, payload: jwt.verify(token, getQrSecret()) };
  } catch (error) {
    return { valid: false, error };
  }
};

const generateQueueJoinQR = async (req, res) => {
  try {
    console.log('Generate queue join QR request:', {
      queueId: req.params.id || req.params.queueId,
      userId: req.user?._id?.toString(),
      role: req.user?.role,
    });

    const queue = await Queue.findById(req.params.id || req.params.queueId);
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.json({
      success: true,
      data: buildQueueJoinData(queue),
    });
  } catch (error) {
    console.error('Generate queue join QR error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const generateAdminCheckinQR = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id || req.params.queueId);
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.json({
      success: true,
      data: buildAdminCheckinData(queue),
    });
  } catch (error) {
    console.error('Generate admin check-in QR error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getQueueDetailsFromToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = verifyQueueJoinToken(token);
    if (!decoded.valid || decoded.payload.type !== 'queue_join') {
      return res.status(400).json({ success: false, message: 'Invalid or expired QR token' });
    }

    const queue = await Queue.findById(decoded.payload.queueId).populate('admin', 'name');
    if (!queue || !queue.isActive) {
      return res.status(404).json({ success: false, message: 'Queue not available' });
    }

    return res.json({
      success: true,
      data: {
        queueId: queue._id,
        name: queue.name,
        description: queue.description,
        serviceType: queue.serviceType,
        isPaused: queue.isPaused,
        avgServiceTime: queue.avgServiceTime,
        adminName: queue.admin?.name || 'Admin',
      },
    });
  } catch (error) {
    console.error('Get queue details from token error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const joinQueueFromQr = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = verifyQueueJoinToken(token);
    if (!decoded.valid || decoded.payload.type !== 'queue_join') {
      return res.status(400).json({ success: false, message: 'Invalid or expired QR token' });
    }

    const result = await joinQueueForUser({
      queueId: decoded.payload.queueId,
      userId: req.user._id,
      io: req.io,
      source: 'qr',
    });

    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
        ...(result.data && { data: result.data }),
      });
    }

    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error('Join queue from QR error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  buildQueueJoinData,
  buildAdminCheckinData,
  generateQueueJoinQR,
  generateAdminCheckinQR,
  getQueueDetailsFromToken,
  joinQueueFromQr,
};
