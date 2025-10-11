const mongoose = require('mongoose');

const lightCommandSchema = new mongoose.Schema({
  lightId: {
    type: String,
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true
  },
  command: {
    type: String,
    enum: ['ON', 'OFF'],
    required: true
  },
  floor: Number,
  room: Number,
  previousState: String,
  newState: String,
  reason: String,
  executedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'executed', 'failed'],
    default: 'executed'
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
lightCommandSchema.index({ lightId: 1, executedAt: -1 });
lightCommandSchema.index({ deviceId: 1, executedAt: -1 });

module.exports = mongoose.model('LightCommand', lightCommandSchema);

