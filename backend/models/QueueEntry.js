const mongoose = require('mongoose');

/**
 * QueueEntry Model
 * Represents a user's position in a specific queue
 */
const queueEntrySchema = new mongoose.Schema(
  {
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: [true, 'Queue is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    position: {
      type: Number,
      required: [true, 'Position is required'],
      min: [1, 'Position must be at least 1'],
    },
    status: {
      type: String,
      enum: ['waiting', 'called', 'completed', 'cancelled'],
      default: 'waiting',
    },
    joinSource: {
      type: String,
      enum: ['app', 'qr', 'kiosk', 'api'],
      default: 'app',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
    },
    serviceStartedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    estimatedWaitTime: {
      type: Number, // in minutes
      default: 0,
    },
    actualServiceTime: {
      type: Number, // in minutes (calculated after completion)
    },
    qrCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    notificationSent: {
      joinNotification: { type: Boolean, default: false },
      nearTurnNotification: { type: Boolean, default: false },
      lastKnownPosition: { type: Number, default: null },
      pausedNotification: { type: Boolean, default: false },
    },
    userLocation: {
      latitude: Number,
      longitude: Number,
    },
    predictedWaitTime: {
      type: Number,
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queue queries
queueEntrySchema.index({ queue: 1, status: 1, position: 1 });
queueEntrySchema.index({ user: 1 });

/**
 * Update position when status changes
 */
queueEntrySchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'called' && !this.calledAt) {
      this.calledAt = new Date();
    }
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
