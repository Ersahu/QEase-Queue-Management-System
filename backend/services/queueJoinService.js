const Queue = require('../models/Queue');
const QueueEntry = require('../models/QueueEntry');
const { predictWaitTime } = require('../utils/waitTimePredictor');

const joinQueueForUser = async ({ queueId, userId, io, source = 'app' }) => {
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

  const existingEntry = await QueueEntry.findOne({
    queue: queue._id,
    user: userId,
    status: { $in: ['waiting', 'called'] },
  });

  if (existingEntry) {
    return {
      success: false,
      statusCode: 400,
      message: 'You are already in this queue',
      data: { entryId: existingEntry._id, position: existingEntry.position },
    };
  }

  const lastEntry = await QueueEntry.findOne({
    queue: queue._id,
    status: { $in: ['waiting', 'called'] },
  }).sort({ position: -1 });

  const newPosition = lastEntry ? lastEntry.position + 1 : 1;
  const prediction = await predictWaitTime(queue._id, newPosition);
  const estimatedWaitTime = prediction.success ? prediction.predictedWaitTime : 0;

  const entry = await QueueEntry.create({
    queue: queue._id,
    user: userId,
    position: newPosition,
    estimatedWaitTime,
    joinSource: source,
  });

  const populatedEntry = await QueueEntry.findById(entry._id)
    .populate('user', 'name email')
    .populate('queue', 'name avgServiceTime');

  if (io) {
    io.to(`queue_${queue._id}`).emit('queueUpdated', {
      queueId: queue._id,
      action: 'joined',
      entry: populatedEntry,
      newPosition,
      source,
    });
  }

  return {
    success: true,
    statusCode: 201,
    message: 'Successfully joined the queue',
    data: {
      entryId: populatedEntry._id,
      position: newPosition,
      estimatedWaitTime,
      queueName: queue.name,
    },
  };
};

module.exports = { joinQueueForUser };
