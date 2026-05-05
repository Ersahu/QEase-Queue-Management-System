const User = require('../models/User');
const { joinQueueWithToken } = require('./tokenService');

const joinQueueForUser = async ({ queueId, userId, io, source = 'app' }) => {
  const user = await User.findById(userId);

  if (!user) {
    return { success: false, statusCode: 404, message: 'User not found' };
  }

  const result = await joinQueueWithToken({
    queueId,
    user: userId,
    userId,
    name: user.name,
    phone: user.phone || '0000000000',
    serviceType: 'other',
    io,
  });

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    statusCode: result.statusCode,
    message: 'Successfully joined the queue',
    data: {
      entryId: result.data.id,
      tokenNumber: result.data.tokenNumber,
      position: result.data.position,
      estimatedWaitTime: result.data.estimatedWaitTime,
      queueName: result.data.queueName,
    },
  };
};

module.exports = { joinQueueForUser };
