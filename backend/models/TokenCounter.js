const mongoose = require('mongoose');

const tokenCounterSchema = new mongoose.Schema(
  {
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: true,
      unique: true,
    },
    sequence: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TokenCounter', tokenCounterSchema);
