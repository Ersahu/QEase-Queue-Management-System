const mongoose = require('mongoose');
const Queue = require('../models/Queue');
const QueueEntry = require('../models/QueueEntry');

const getDateRange = (days = 7) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - Number(days));
  return { startDate, endDate };
};

const getAdminAnalytics = async (req, res) => {
  try {
    const { days = 7, queueId } = req.query;
    const { startDate, endDate } = getDateRange(days);

    const queueFilter = { admin: req.user._id };
    if (queueId && mongoose.Types.ObjectId.isValid(queueId)) {
      queueFilter._id = queueId;
    }

    const adminQueues = await Queue.find(queueFilter).select('_id name');
    const queueIds = adminQueues.map((queue) => queue._id);

    if (queueIds.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: {
            totalUsersServed: 0,
            averageWaitTimeMinutes: 0,
            averageServiceTimeMinutes: 0,
            activeQueues: 0,
          },
          peakHours: [],
          queueTrends: [],
          queueBreakdown: [],
        },
      });
    }

    const baseMatch = {
      queue: { $in: queueIds },
      createdAt: { $gte: startDate, $lte: endDate },
    };

    const completedMatch = {
      ...baseMatch,
      status: 'completed',
      completedAt: { $ne: null },
    };

    const summaryPipeline = [
      { $match: completedMatch },
      {
        $project: {
          queue: 1,
          waitMinutes: {
            $divide: [{ $subtract: ['$calledAt', '$joinedAt'] }, 1000 * 60],
          },
          serviceMinutes: {
            $ifNull: [
              '$actualServiceTime',
              { $divide: [{ $subtract: ['$completedAt', '$calledAt'] }, 1000 * 60] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalUsersServed: { $sum: 1 },
          averageWaitTimeMinutes: { $avg: '$waitMinutes' },
          averageServiceTimeMinutes: { $avg: '$serviceMinutes' },
        },
      },
    ];

    const peakHoursPipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: { $hour: '$joinedAt' },
          customerCount: { $sum: 1 },
        },
      },
      { $sort: { customerCount: -1 } },
      { $limit: 5 },
    ];

    const queueTrendsPipeline = [
      { $match: completedMatch },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          },
          served: { $sum: 1 },
          averageWaitTimeMinutes: {
            $avg: {
              $divide: [{ $subtract: ['$completedAt', '$joinedAt'] }, 1000 * 60],
            },
          },
          averageServiceTimeMinutes: { $avg: '$actualServiceTime' },
        },
      },
      { $sort: { '_id.day': 1 } },
    ];

    const queueBreakdownPipeline = [
      { $match: completedMatch },
      {
        $group: {
          _id: '$queue',
          served: { $sum: 1 },
          averageWaitTimeMinutes: {
            $avg: {
              $divide: [{ $subtract: ['$calledAt', '$joinedAt'] }, 1000 * 60],
            },
          },
          averageServiceTimeMinutes: { $avg: '$actualServiceTime' },
        },
      },
      { $sort: { served: -1 } },
    ];

    const [summary, peakHours, queueTrends, queueBreakdown, activeQueues] = await Promise.all([
      QueueEntry.aggregate(summaryPipeline),
      QueueEntry.aggregate(peakHoursPipeline),
      QueueEntry.aggregate(queueTrendsPipeline),
      QueueEntry.aggregate(queueBreakdownPipeline),
      Queue.countDocuments({ _id: { $in: queueIds }, isActive: true }),
    ]);

    const queueNameMap = new Map(adminQueues.map((q) => [q._id.toString(), q.name]));

    res.json({
      success: true,
      data: {
        summary: {
          totalUsersServed: summary[0]?.totalUsersServed || 0,
          averageWaitTimeMinutes: Number((summary[0]?.averageWaitTimeMinutes || 0).toFixed(1)),
          averageServiceTimeMinutes: Number((summary[0]?.averageServiceTimeMinutes || 0).toFixed(1)),
          activeQueues,
        },
        peakHours: peakHours.map((hourBucket) => ({
          hour: `${String(hourBucket._id).padStart(2, '0')}:00`,
          customerCount: hourBucket.customerCount,
          servedCount: hourBucket.customerCount,
        })),
        queueTrends: queueTrends.map((trend) => ({
          day: trend._id.day,
          served: trend.served,
          averageWaitTimeMinutes: Number(trend.averageWaitTimeMinutes.toFixed(1)),
          averageServiceTimeMinutes: Number((trend.averageServiceTimeMinutes || 0).toFixed(1)),
        })),
        queueBreakdown: queueBreakdown.map((item) => ({
          queueId: item._id,
          queueName: queueNameMap.get(item._id.toString()) || 'Unknown Queue',
          served: item.served,
          averageWaitTimeMinutes: Number(item.averageWaitTimeMinutes.toFixed(1)),
          averageServiceTimeMinutes: Number((item.averageServiceTimeMinutes || 0).toFixed(1)),
        })),
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminAnalytics,
};
