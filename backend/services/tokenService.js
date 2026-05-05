const Queue = require('../models/Queue');
const QueueEntry = require('../models/QueueEntry');
const TokenCounter = require('../models/TokenCounter');
const { encrypt, decrypt } = require('../utils/crypto');
const { predictWaitTime } = require('../utils/waitTimePredictor');

const TOKEN_PREFIX = 'A';

const formatTokenNumber = (sequence) =>
  `${TOKEN_PREFIX}${String(sequence).padStart(3, '0')}`;

const getNextTokenSequence = async (queueId) => {
  const counter = await TokenCounter.findOneAndUpdate(
    { queue: queueId },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return counter.sequence;
};

const getCurrentToken = async (queueId) => {
  const currentEntry = await QueueEntry.findOne({
    queue: queueId,
    status: 'called',
  }).sort({ calledAt: -1, position: 1 });

  return currentEntry?.tokenNumber || null;
};

const serializeEntry = (entry, { includePhone = false } = {}) => {
  const queue = entry.queue;
  const user = entry.user;
  const phone = includePhone
    ? decrypt(entry.customerPhoneEncrypted)
    : entry.customerPhoneLast4
      ? `***${entry.customerPhoneLast4}`
      : user?.phone || '';

  return {
    id: entry._id,
    queueId: queue?._id || entry.queue,
    queueName: queue?.name,
    tokenNumber: entry.tokenNumber,
    tokenSequence: entry.tokenSequence,
    tokenIssuedAt: entry.tokenIssuedAt || entry.joinedAt,
    position: entry.position,
    status: entry.status,
    estimatedWaitTime: entry.estimatedWaitTime,
    serviceType: entry.serviceType || queue?.serviceType || 'other',
    joinedAt: entry.joinedAt,
    calledAt: entry.calledAt,
    completedAt: entry.completedAt,
    customer: {
      name: entry.customerName || user?.name || 'Customer',
      phone,
      phoneLast4: entry.customerPhoneLast4 || user?.phone?.slice(-4) || '',
      userId: user?._id,
    },
  };
};

const getQueueStatus = async (queueId, entry = null) => {
  const [currentToken, waitingCount] = await Promise.all([
    getCurrentToken(queueId),
    QueueEntry.countDocuments({ queue: queueId, status: 'waiting' }),
  ]);

  let entryStatus = null;
  if (entry) {
    const refreshedEntry = await QueueEntry.findById(entry._id)
      .populate('queue', 'name avgServiceTime serviceType')
      .populate('user', 'name email phone')
      .select('+customerPhoneEncrypted');

    entryStatus = serializeEntry(refreshedEntry);
  }

  return {
    currentToken,
    waitingCount,
    entry: entryStatus,
  };
};

const joinQueueWithToken = async ({ queueId, name, phone, serviceType, userId = null, io }) => {
  const queue = await Queue.findById(queueId);

  if (!queue) {
    return { success: false, statusCode: 404, message: 'Queue not found' };
  }

  if (!queue.isActive) {
    return { success: false, statusCode: 400, message: 'Queue is not active' };
  }

  if (queue.isPaused) {
    return { success: false, statusCode: 400, message: 'Queue is currently paused' };
  }

  const cleanName = String(name || '').trim();
  const cleanPhone = String(phone || '').replace(/[^\d+]/g, '').trim();

  if (!cleanName || cleanName.length < 2) {
    return { success: false, statusCode: 400, message: 'Name is required' };
  }

  if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 7) {
    return { success: false, statusCode: 400, message: 'Valid phone number is required' };
  }

  const existingFilter = {
    queue: queue._id,
    status: { $in: ['waiting', 'called'] },
  };

  if (userId) {
    existingFilter.user = userId;
  } else {
    existingFilter.customerPhoneLast4 = cleanPhone.slice(-4);
    existingFilter.customerName = cleanName;
  }

  const existingEntry = await QueueEntry.findOne(existingFilter);
  if (existingEntry) {
    return {
      success: false,
      statusCode: 400,
      message: 'This customer is already in the queue',
      data: { entryId: existingEntry._id, position: existingEntry.position },
    };
  }

  const [lastEntry, tokenSequence] = await Promise.all([
    QueueEntry.findOne({
      queue: queue._id,
      status: { $in: ['waiting', 'called'] },
    }).sort({ position: -1 }),
    getNextTokenSequence(queue._id),
  ]);

  const newPosition = lastEntry ? lastEntry.position + 1 : 1;
  const prediction = await predictWaitTime(queue._id, newPosition);
  const estimatedWaitTime = prediction.success ? prediction.predictedWaitTime : 0;

  const entry = await QueueEntry.create({
    queue: queue._id,
    user: userId,
    customerName: cleanName,
    customerPhoneEncrypted: encrypt(cleanPhone),
    customerPhoneLast4: cleanPhone.slice(-4),
    serviceType: serviceType || queue.serviceType || 'other',
    tokenNumber: formatTokenNumber(tokenSequence),
    tokenSequence,
    tokenIssuedAt: new Date(),
    position: newPosition,
    estimatedWaitTime,
    joinSource: userId ? 'app' : 'self-service',
  });

  const populatedEntry = await QueueEntry.findById(entry._id)
    .populate('queue', 'name avgServiceTime serviceType')
    .populate('user', 'name email phone')
    .select('+customerPhoneEncrypted');

  const tokenData = serializeEntry(populatedEntry);

  if (io) {
    io.to(`queue_${queue._id}`).emit('queueUpdated', {
      queueId: queue._id,
      action: 'token_joined',
      entry: tokenData,
      newPosition,
    });

    io.to(`queue_${queue._id}`).emit('token:updated', {
      queueId: queue._id,
      entry: tokenData,
      message: `${tokenData.tokenNumber} joined ${queue.name}`,
    });
  }

  return {
    success: true,
    statusCode: 201,
    message: 'Token generated successfully',
    data: tokenData,
  };
};

module.exports = {
  joinQueueWithToken,
  getQueueStatus,
  serializeEntry,
};
