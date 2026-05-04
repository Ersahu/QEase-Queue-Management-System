const mongoose = require('mongoose');

/**
 * Queue Model
 * Represents a service queue managed by an admin
 */
const queueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Queue name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ['clinic', 'salon', 'bank', 'restaurant', 'retail', 'government', 'other'],
      default: 'other',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    avgServiceTime: {
      type: Number,
      default: 5, // in minutes
      min: [1, 'Service time must be at least 1 minute'],
    },
    totalServed: {
      type: Number,
      default: 0,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by admin
queueSchema.index({ admin: 1 });
queueSchema.index({ location: '2dsphere' });

/**
 * Virtual for getting current waiting count
 */
queueSchema.virtual('currentWaiting', {
  ref: 'QueueEntry',
  localField: '_id',
  foreignField: 'queue',
  count: true,
  match: { status: 'waiting' },
});

queueSchema.set('toObject', { virtuals: true });
queueSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Queue', queueSchema);
