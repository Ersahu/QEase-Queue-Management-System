const mongoose = require('mongoose');

/**
 * ChatSession Model
 * Stores chatbot conversation history for analytics and context
 */
const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'bot'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        intent: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
chatSessionSchema.index({ user: 1, lastActivity: -1 });

/**
 * Update lastActivity on save
 */
chatSessionSchema.pre('save', function (next) {
  this.lastActivity = new Date();
  next();
});

/**
 * Add a message to the session
 */
chatSessionSchema.methods.addMessage = function (role, content, intent = null) {
  this.messages.push({
    role,
    content,
    intent,
    timestamp: new Date(),
  });
  return this.save();
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);
