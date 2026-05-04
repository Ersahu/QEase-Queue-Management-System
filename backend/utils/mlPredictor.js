/**
 * ML-Based Wait Time Prediction Engine
 * Uses Linear Regression for accurate wait time predictions
 */

const QueueEntry = require('../models/QueueEntry');
const Queue = require('../models/Queue');

/**
 * Simple Linear Regression Model
 */
class SimpleLinearRegression {
  constructor() {
    this.weights = [];
    this.bias = 0;
    this.isTrained = false;
  }

  /**
   * Train the model using closed-form solution (Normal Equation)
   * @param {Array<Array<number>>} features - 2D array of features
   * @param {Array<number>} targets - Array of target values
   */
  train(features, targets) {
    if (!features || features.length === 0) {
      console.warn('No training data provided');
      return;
    }

    const n = features.length;
    const numFeatures = features[0].length;

    // Add bias term (column of 1s)
    const X = features.map(f => [1, ...f]);
    const y = targets;

    // Transpose X
    const XT = X[0].map((_, i) => X.map(row => row[i]));

    // XT * X
    const XTX = this.multiplyMatrices(XT, X);

    // XT * y
    const XTy = XT.map(row => row.reduce((sum, val, i) => sum + val * y[i], 0));

    // Solve (XTX)^-1 * XTy using simple Gaussian elimination
    try {
      const augmented = XTX.map((row, i) => [...row, XTy[i]]);
      this.gaussianElimination(augmented);
      this.weights = augmented.map(row => row[numFeatures]);
      this.bias = this.weights[0];
      this.weights = this.weights.slice(1);
      this.isTrained = true;
    } catch (error) {
      console.error('Training failed, using fallback:', error.message);
      this.isTrained = false;
    }
  }

  /**
   * Predict using trained model
   * @param {Array<number>} features - Feature array
   * @returns {number} Predicted value
   */
  predict(features) {
    if (!this.isTrained) {
      return null;
    }

    let result = this.bias;
    for (let i = 0; i < features.length; i++) {
      result += this.weights[i] * features[i];
    }
    return Math.max(0, result); // Wait time can't be negative
  }

  /**
   * Matrix multiplication helper
   */
  multiplyMatrices(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    const result = Array(rowsA).fill(null).map(() => Array(colsB).fill(0));

    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsB; j++) {
        for (let k = 0; k < colsA; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }
    return result;
  }

  /**
   * Gaussian elimination to solve linear system
   */
  gaussianElimination(matrix) {
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

      // Check for singular matrix
      if (Math.abs(matrix[i][i]) < 1e-10) {
        throw new Error('Singular matrix');
      }

      // Normalize pivot row
      for (let k = i + 1; k <= n; k++) {
        matrix[i][k] /= matrix[i][i];
      }
      matrix[i][i] = 1;

      // Eliminate column
      for (let m = 0; m < n; m++) {
        if (m !== i) {
          const factor = matrix[m][i];
          for (let k = i; k <= n; k++) {
            matrix[m][k] -= factor * matrix[i][k];
          }
        }
      }
    }
  }
}

// Cache for trained models (in production, use Redis or database)
const modelCache = new Map();

/**
 * Extract features for ML prediction
 * @param {Object} queue - Queue object
 * @param {Number} position - User's position in queue
 * @param {Object} context - Additional context (hour, day, etc.)
 * @returns {Array<number>} Feature array
 */
const extractFeatures = (queue, position, context = {}) => {
  const hour = context.hour || new Date().getHours();
  const dayOfWeek = context.dayOfWeek || new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
  const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16) ? 1 : 0;
  const avgServiceTime = queue.avgServiceTime || 5;
  const queueLength = position;

  return [
    queueLength,
    avgServiceTime,
    hour,
    isWeekend,
    isPeakHour,
  ];
};

/**
 * Train ML model for a specific queue using historical data
 * @param {String} queueId - Queue ID
 * @returns {Object} Training result
 */
const trainModel = async (queueId) => {
  try {
    // Get completed entries from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalEntries = await QueueEntry.find({
      queue: queueId,
      status: 'completed',
      completedAt: { $gte: thirtyDaysAgo },
      actualServiceTime: { $exists: true },
    }).populate('queue');

    if (historicalEntries.length < 10) {
      return {
        success: false,
        message: 'Insufficient data for training (need at least 10 entries)',
        count: historicalEntries.length,
      };
    }

    const queue = historicalEntries[0].queue;

    // Prepare training data
    const features = [];
    const targets = [];

    for (const entry of historicalEntries) {
      const joinHour = new Date(entry.joinedAt).getHours();
      const joinDay = new Date(entry.joinedAt).getDay();

      // Calculate actual wait time (from join to completion)
      const actualWaitTime = (entry.completedAt - entry.joinedAt) / (1000 * 60);

      const featureVector = extractFeatures(queue, entry.position, {
        hour: joinHour,
        dayOfWeek: joinDay,
      });

      features.push(featureVector);
      targets.push(actualWaitTime);
    }

    // Train model
    const model = new SimpleLinearRegression();
    model.train(features, targets);

    // Cache the model
    modelCache.set(queueId, {
      model,
      trainedAt: new Date(),
      dataPoints: historicalEntries.length,
    });

    return {
      success: true,
      message: 'Model trained successfully',
      dataPoints: historicalEntries.length,
      trainedAt: new Date(),
    };
  } catch (error) {
    console.error('Error training model:', error);
    return {
      success: false,
      message: 'Training failed',
      error: error.message,
    };
  }
};

/**
 * Predict wait time using ML model
 * @param {String} queueId - Queue ID
 * @param {Number} position - User's position
 * @param {Object} context - Additional context
 * @returns {Object} Prediction result
 */
const predict = async (queueId, position, context = {}) => {
  try {
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return {
        success: false,
        message: 'Queue not found',
      };
    }

    // Check if we have a trained model
    let modelData = modelCache.get(queueId);

    // Train model if not cached or stale (older than 1 hour)
    if (!modelData || (new Date() - modelData.trainedAt) > 3600000) {
      const trainResult = await trainModel(queueId);
      if (trainResult.success) {
        modelData = modelCache.get(queueId);
      }
    }

    // If we have a trained model, use it
    if (modelData && modelData.model.isTrained) {
      const features = extractFeatures(queue, position, context);
      const predictedTime = modelData.model.predict(features);

      return {
        success: true,
        predictedWaitTime: Math.round(predictedTime),
        method: 'ml',
        confidence: modelData.dataPoints > 50 ? 'high' : modelData.dataPoints > 20 ? 'medium' : 'low',
        dataPoints: modelData.dataPoints,
        features: {
          position,
          avgServiceTime: queue.avgServiceTime,
          hour: context.hour || new Date().getHours(),
        },
      };
    }

    // Fallback to rule-based prediction
    return {
      success: true,
      predictedWaitTime: null,
      method: 'fallback',
      message: 'Insufficient data for ML prediction, using rule-based fallback',
    };
  } catch (error) {
    console.error('Error predicting wait time:', error);
    return {
      success: false,
      message: 'Prediction failed',
      error: error.message,
    };
  }
};

/**
 * Get time recommendations based on historical crowd data
 * @param {String} queueId - Queue ID
 * @returns {Object} Time recommendations
 */
const getTimeRecommendation = async (queueId) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await QueueEntry.find({
      queue: queueId,
      joinedAt: { $gte: thirtyDaysAgo },
    });

    if (entries.length < 10) {
      return {
        success: false,
        message: 'Insufficient data for recommendations',
      };
    }

    // Analyze crowd patterns by hour
    const hourCrowd = {};
    for (let i = 0; i < 24; i++) {
      hourCrowd[i] = { count: 0, totalWait: 0 };
    }

    for (const entry of entries) {
      const hour = new Date(entry.joinedAt).getHours();
      hourCrowd[hour].count++;

      if (entry.completedAt && entry.joinedAt) {
        const waitTime = (entry.completedAt - entry.joinedAt) / (1000 * 60);
        hourCrowd[hour].totalWait += waitTime;
      }
    }

    // Calculate averages and find best times
    const analysis = Object.entries(hourCrowd)
      .filter(([_, data]) => data.count > 0)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        crowdLevel: data.count,
        avgWaitTime: data.totalWait / data.count,
      }));

    // Sort by crowd level (ascending)
    const sortedByCrowd = [...analysis].sort((a, b) => a.crowdLevel - b.crowdLevel);
    const bestTimes = sortedByCrowd.slice(0, 3).map(item => ({
      hour: item.hour,
      timeLabel: `${item.hour}:00`,
      crowdLevel: item.crowdLevel,
      avgWaitTime: Math.round(item.avgWaitTime),
      recommendation: item.crowdLevel < 5 ? 'Excellent' : item.crowdLevel < 10 ? 'Good' : 'Moderate',
    }));

    // Current crowd status
    const currentHour = new Date().getHours();
    const currentStatus = analysis.find(a => a.hour === currentHour);

    return {
      success: true,
      currentHour: currentHour,
      currentCrowdLevel: currentStatus ? currentStatus.crowdLevel : 'unknown',
      bestTimes,
      totalDataPoints: entries.length,
    };
  } catch (error) {
    console.error('Error getting time recommendations:', error);
    return {
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message,
    };
  }
};

module.exports = {
  trainModel,
  predict,
  getTimeRecommendation,
  SimpleLinearRegression,
};
