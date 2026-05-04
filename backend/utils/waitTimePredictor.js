/**
 * Wait Time Prediction Utility
 * Calculates estimated wait times based on queue position and service patterns
 * Uses intelligent algorithms including weighted averages for better accuracy
 */

const QueueEntry = require('../models/QueueEntry');
const Queue = require('../models/Queue');
const mlPredictor = require('./mlPredictor');

/**
 * Calculate average service time for a queue using historical data
 * Uses weighted average - recent services have more importance
 * 
 * @param {String} queueId - Queue ID
 * @returns {Number} Average service time in minutes
 */
const calculateAverageServiceTime = async (queueId) => {
  try {
    // Get completed entries from last 7 days for better relevance
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const completedEntries = await QueueEntry.find({
      queue: queueId,
      status: 'completed',
      completedAt: { $gte: sevenDaysAgo },
      actualServiceTime: { $exists: true, $ne: null },
    }).sort({ completedAt: -1 }); // Most recent first

    if (completedEntries.length === 0) {
      // Fallback: get all-time data if no recent data
      const allEntries = await QueueEntry.find({
        queue: queueId,
        status: 'completed',
        actualServiceTime: { $exists: true, $ne: null },
      });

      if (allEntries.length === 0) {
        return null; // No data available
      }

      // Simple average for all-time data
      const totalTime = allEntries.reduce((sum, entry) => sum + entry.actualServiceTime, 0);
      return totalTime / allEntries.length;
    }

    // Weighted average - recent entries have more weight
    const weights = completedEntries.map((_, index) => {
      // Exponential decay: most recent gets weight 1.0, oldest gets ~0.3
      return Math.exp(-0.1 * index);
    });

    const weightedSum = completedEntries.reduce((sum, entry, index) => {
      return sum + (entry.actualServiceTime * weights[index]);
    }, 0);

    const weightTotal = weights.reduce((sum, w) => sum + w, 0);

    return weightedSum / weightTotal;
  } catch (error) {
    console.error('Error calculating average service time:', error);
    return null;
  }
};

/**
 * Predict wait time for a user at a given position
 * Uses multiple factors for accurate prediction
 * 
 * @param {String} queueId - Queue ID
 * @param {Number} position - User's position in queue
 * @returns {Object} Prediction result with confidence level
 */
const predictWaitTime = async (queueId, position) => {
  try {
    const queue = await Queue.findById(queueId);
    
    if (!queue) {
      return {
        success: false,
        message: 'Queue not found',
      };
    }

    // Edge case: Empty queue
    if (position === 0 || position === null) {
      return {
        success: true,
        position: 0,
        predictedWaitTime: 0,
        message: 'No waiting time',
        confidence: 'high',
      };
    }

    // Try ML-based prediction first
    const mlPrediction = await mlPredictor.predict(queueId, position);
    
    if (mlPrediction.success && mlPrediction.method === 'ml') {
      // ML prediction successful
      return {
        success: true,
        position,
        predictedWaitTime: mlPrediction.predictedWaitTime,
        method: 'ml',
        confidence: mlPrediction.confidence,
        dataPoints: mlPrediction.dataPoints,
        factors: mlPrediction.features,
      };
    }

    // Fallback to rule-based prediction
    let avgServiceTime = await calculateAverageServiceTime(queueId);

    // Fallback to queue's default or system default
    if (!avgServiceTime) {
      avgServiceTime = queue.avgServiceTime || 5;
    }

    // Base prediction
    const baseWaitTime = position * avgServiceTime;

    // Apply time-of-day adjustment
    const hour = new Date().getHours();
    const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
    const peakMultiplier = isPeakHour ? 1.3 : 1.0;

    // Apply day-of-week adjustment (weekends might be busier)
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 1.15 : 1.0;

    // Apply queue length factor (longer queues tend to slow down)
    const currentWaiting = await QueueEntry.countDocuments({
      queue: queueId,
      status: { $in: ['waiting', 'called'] },
    });
    const queueLengthFactor = currentWaiting > 10 ? 1.1 : 1.0;

    // Calculate final prediction
    const predictedWaitTime = Math.round(
      baseWaitTime * peakMultiplier * weekendMultiplier * queueLengthFactor
    );

    // Determine confidence level
    let confidence = 'low';
    const recentEntries = await QueueEntry.countDocuments({
      queue: queueId,
      status: 'completed',
      completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    if (recentEntries >= 20) {
      confidence = 'high';
    } else if (recentEntries >= 5) {
      confidence = 'medium';
    }

    return {
      success: true,
      position,
      predictedWaitTime,
      method: 'rule-based',
      avgServiceTime: Math.round(avgServiceTime),
      confidence,
      factors: {
        baseWaitTime: Math.round(baseWaitTime),
        peakHourAdjustment: isPeakHour,
        weekendAdjustment: isWeekend,
        queueLengthFactor,
      },
    };
  } catch (error) {
    console.error('Error predicting wait time:', error);
    return {
      success: false,
      message: 'Failed to predict wait time',
      error: error.message,
    };
  }
};

/**
 * Update queue's average service time based on actual completion
 * Calculates actual service time and stores it in the entry
 * 
 * @param {Object} entry - QueueEntry object
 */
const updateActualServiceTime = async (entry) => {
  try {
    if (!entry.calledAt || !entry.completedAt) {
      return;
    }

    // Calculate actual service time in minutes
    const serviceTimeMs = entry.completedAt - entry.calledAt;
    const serviceTimeMinutes = serviceTimeMs / (1000 * 60);

    // Store in the entry
    entry.actualServiceTime = Math.round(serviceTimeMinutes * 10) / 10; // Round to 1 decimal
    await entry.save();
  } catch (error) {
    console.error('Error updating actual service time:', error);
  }
};

/**
 * Get queue statistics for analytics
 * 
 * @param {String} queueId - Queue ID
 * @returns {Object} Statistics object
 */
const getQueueStatistics = async (queueId) => {
  try {
    const entries = await QueueEntry.find({
      queue: queueId,
      status: 'completed',
      actualServiceTime: { $exists: true },
    });

    if (!entries || entries.length === 0) {
      return {
        averageWaitTime: 0,
        averageServiceTime: 0,
        totalCustomers: 0,
        peakHour: null,
        confidence: 'low',
      };
    }

    // Calculate average wait time (time from join to called)
    const totalWaitTime = entries.reduce((sum, entry) => {
      if (entry.joinedAt && entry.calledAt) {
        return sum + (entry.calledAt - entry.joinedAt) / (1000 * 60);
      }
      return sum;
    }, 0);

    // Calculate average service time
    const totalServiceTime = entries.reduce((sum, entry) => {
      return sum + (entry.actualServiceTime || 0);
    }, 0);

    // Find peak hour
    const hourCounts = {};
    entries.forEach((entry) => {
      const hour = new Date(entry.joinedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts).length > 0
      ? parseInt(Object.entries(hourCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0])
      : null;

    // Determine confidence based on data volume
    let confidence = 'low';
    if (entries.length >= 20) confidence = 'high';
    else if (entries.length >= 5) confidence = 'medium';

    return {
      averageWaitTime: Math.round(totalWaitTime / entries.length),
      averageServiceTime: Math.round(totalServiceTime / entries.length),
      totalCustomers: entries.length,
      peakHour,
      confidence,
    };
  } catch (error) {
    console.error('Error getting queue statistics:', error);
    return {
      averageWaitTime: 0,
      averageServiceTime: 0,
      totalCustomers: 0,
      peakHour: null,
      confidence: 'low',
    };
  }
};

/**
 * Backward compatible wrapper for old code
 * @deprecated Use predictWaitTime instead
 */
const calculateEstimatedWait = async (queue, position) => {
  if (!queue || !position) return 0;
  const result = await predictWaitTime(queue._id, position);
  return result.success ? result.predictedWaitTime : position * (queue.avgServiceTime || 5);
};

/**
 * Backward compatible wrapper
 * @deprecated Use updateActualServiceTime instead
 */
const updateAverageServiceTime = async (queue, actualTime) => {
  // This is now handled automatically when marking as completed
  console.log('Note: updateAverageServiceTime is deprecated. Service times are now calculated automatically.');
};

module.exports = {
  calculateAverageServiceTime,
  predictWaitTime,
  updateActualServiceTime,
  getQueueStatistics,
  calculateEstimatedWait, // Keep for backward compatibility
  updateAverageServiceTime, // Keep for backward compatibility
};
