/**
 * Location & Time Recommendation Service
 * Analyzes crowd patterns and suggests optimal visit times
 */

const QueueEntry = require('../models/QueueEntry');
const Queue = require('../models/Queue');

/**
 * Get time-based recommendations for a queue
 * @param {String} queueId - Queue ID
 * @returns {Object} Recommendations
 */
const getTimeRecommendations = async (queueId) => {
  try {
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return {
        success: false,
        message: 'Queue not found',
      };
    }

    // Get historical data from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await QueueEntry.find({
      queue: queueId,
      joinedAt: { $gte: thirtyDaysAgo },
      status: 'completed',
    });

    if (entries.length < 10) {
      return {
        success: false,
        message: 'Insufficient data for recommendations',
        dataPoints: entries.length,
      };
    }

    // Analyze patterns by hour
    const hourAnalysis = {};
    for (let i = 0; i < 24; i++) {
      hourAnalysis[i] = {
        count: 0,
        totalWaitTime: 0,
        completedCount: 0,
      };
    }

    for (const entry of entries) {
      const hour = new Date(entry.joinedAt).getHours();
      hourAnalysis[hour].count++;

      if (entry.completedAt && entry.joinedAt) {
        const waitTime = (entry.completedAt - entry.joinedAt) / (1000 * 60);
        hourAnalysis[hour].totalWaitTime += waitTime;
        hourAnalysis[hour].completedCount++;
      }
    }

    // Calculate metrics and recommendations
    const hourlyData = Object.entries(hourAnalysis)
      .filter(([_, data]) => data.count > 0)
      .map(([hour, data]) => {
        const avgWait = data.completedCount > 0 ? data.totalWaitTime / data.completedCount : 0;
        const crowdLevel = data.count;

        let recommendation;
        if (crowdLevel < 5 && avgWait < 15) {
          recommendation = 'excellent';
        } else if (crowdLevel < 10 && avgWait < 30) {
          recommendation = 'good';
        } else if (crowdLevel < 20 && avgWait < 45) {
          recommendation = 'moderate';
        } else {
          recommendation = 'busy';
        }

        return {
          hour: parseInt(hour),
          timeLabel: `${hour.toString().padStart(2, '0')}:00`,
          crowdLevel,
          avgWaitTime: Math.round(avgWait),
          recommendation,
          score: crowdLevel * 0.6 + avgWait * 0.4, // Lower is better
        };
      });

    // Sort by score (best times first)
    const sorted = hourlyData.sort((a, b) => a.score - b.score);
    const bestTimes = sorted.slice(0, 5);

    // Current hour status
    const currentHour = new Date().getHours();
    const currentStatus = hourlyData.find(h => h.hour === currentHour);

    // Next 6 hours forecast
    const nextHours = [];
    for (let i = 0; i < 6; i++) {
      const hour = (currentHour + i) % 24;
      const hourData = hourlyData.find(h => h.hour === hour);
      if (hourData) {
        nextHours.push({
          ...hourData,
          isCurrent: i === 0,
        });
      }
    }

    return {
      success: true,
      queueId,
      queueName: queue.name,
      currentHour: currentHour,
      currentStatus: currentStatus || { recommendation: 'unknown', crowdLevel: 0 },
      bestTimes,
      nextHoursForecast: nextHours,
      totalDataPoints: entries.length,
    };
  } catch (error) {
    console.error('Error generating time recommendations:', error);
    return {
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message,
    };
  }
};

/**
 * Store user location (optional feature)
 * @param {String} userId - User ID
 * @param {Object} location - { latitude, longitude }
 * @returns {Object} Result
 */
const updateUserLocation = async (userId, location) => {
  try {
    // This could be integrated with QueueEntry or User model
    // For now, just return success
    return {
      success: true,
      message: 'Location updated',
      location,
    };
  } catch (error) {
    console.error('Error updating location:', error);
    return {
      success: false,
      message: 'Failed to update location',
      error: error.message,
    };
  }
};

/**
 * Get nearby queues (if location is provided)
 * @param {Number} latitude - User latitude
 * @param {Number} longitude - User longitude
 * @returns {Object} Nearby queues
 */
const getNearbyQueues = async (latitude, longitude) => {
  try {
    // In a real implementation, this would use geospatial queries
    // For demo, return all active queues
    const queues = await Queue.find({ isActive: true });

    return {
      success: true,
      queues,
      message: 'Location-based queue search (demo mode)',
    };
  } catch (error) {
    console.error('Error finding nearby queues:', error);
    return {
      success: false,
      message: 'Failed to find nearby queues',
      error: error.message,
    };
  }
};

module.exports = {
  getTimeRecommendations,
  updateUserLocation,
  getNearbyQueues,
};
