const QueueEntry = require('../models/QueueEntry');
const { predictWaitTime } = require('../utils/waitTimePredictor');

const NEAR_TURN_THRESHOLD = 3;
const VALID_JOIN_SOURCES = ['app', 'self-service', 'kiosk', 'api'];

const emitPositionChange = (io, entry, queue, reason) => {
  if (!io) return;
  if (!entry.user?._id) return;

  io.to(`user_${entry.user._id}`).emit('queue:position-updated', {
    entryId: entry._id,
    queueId: queue._id,
    queueName: queue.name,
    position: entry.position,
    estimatedWaitTime: entry.estimatedWaitTime,
    reason,
    message: `Your position in ${queue.name} is now #${entry.position}.`,
  });
};

const emitNearTurn = (io, entry, queue) => {
  if (!io) return;
  if (!entry.user?._id) return;

  io.to(`user_${entry.user._id}`).emit('queue:near-turn', {
    entryId: entry._id,
    queueId: queue._id,
    queueName: queue.name,
    position: entry.position,
    threshold: NEAR_TURN_THRESHOLD,
    message: `Your turn is near in ${queue.name}. You are #${entry.position}.`,
  });
};

const recalculateQueuePositionsAndNotify = async (queue, io, reason = 'queue_update') => {
  const waitingEntries = await QueueEntry.find({
    queue: queue._id,
    status: 'waiting',
  })
    .populate('user', 'name email phone')
    .sort({ position: 1 });

  for (let i = 0; i < waitingEntries.length; i += 1) {
    const entry = waitingEntries[i];
    const nextPosition = i + 1;
    const positionChanged = entry.position !== nextPosition;
    const previouslyKnown = entry.notificationSent.lastKnownPosition;

    if (positionChanged) {
      entry.position = nextPosition;
      const prediction = await predictWaitTime(queue._id, nextPosition);
      entry.estimatedWaitTime = prediction.success ? prediction.predictedWaitTime : 0;
      emitPositionChange(io, entry, queue, reason);
    }

    if (nextPosition <= NEAR_TURN_THRESHOLD && !entry.notificationSent.nearTurnNotification) {
      entry.notificationSent.nearTurnNotification = true;
      emitNearTurn(io, entry, queue);
    }

    if (previouslyKnown !== nextPosition) {
      entry.notificationSent.lastKnownPosition = nextPosition;
    }

    const normalizedJoinSource = !VALID_JOIN_SOURCES.includes(entry.joinSource);
    if (normalizedJoinSource) {
      entry.joinSource = 'app';
    }

    if (positionChanged || previouslyKnown !== nextPosition || normalizedJoinSource) {
      await entry.save();
    }
  }

  return waitingEntries;
};

const notifyQueuePausedResumed = async (queue, io, isPaused) => {
  if (!io) return;

  const waitingEntries = await QueueEntry.find({
    queue: queue._id,
    status: 'waiting',
  }).populate('user', 'name');

  const event = isPaused ? 'queue:paused' : 'queue:resumed';
  const message = isPaused
    ? `${queue.name} is temporarily paused. We will notify you when it resumes.`
    : `${queue.name} has resumed. Please keep an eye on your queue position.`;

  waitingEntries.forEach((entry) => {
    if (!entry.user?._id) return;

    io.to(`user_${entry.user._id}`).emit(event, {
      queueId: queue._id,
      queueName: queue.name,
      message,
    });
  });
};

module.exports = {
  NEAR_TURN_THRESHOLD,
  recalculateQueuePositionsAndNotify,
  notifyQueuePausedResumed,
};
