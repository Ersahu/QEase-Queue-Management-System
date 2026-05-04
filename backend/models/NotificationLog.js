const mongoose = require('mongoose');

/**
 * NotificationLog Model
 * Tracks all notification attempts (SMS/Email) for analytics and debugging
 */
const notificationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: ['sms', 'email', 'push'],
      required: [true, 'Notification type is required'],
    },
    eventType: {
      type: String,
      enum: ['join', 'near-turn', 'called', 'completed', 'custom'],
      required: [true, 'Event type is required'],
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    recipient: {
      type: String,
      required: [true, 'Recipient is required'],
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
notificationLogSchema.index({ user: 1, createdAt: -1 });
notificationLogSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
