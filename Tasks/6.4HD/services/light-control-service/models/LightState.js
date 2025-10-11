const mongoose = require('mongoose');

const lightStateSchema = new mongoose.Schema({
  lightId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  room: {
    type: Number,
    required: true
  },
  desiredState: {
    type: String,
    enum: ['ON', 'OFF'],
    required: true
  },
  lastMotionDetected: Boolean,
  lastLightIntensity: Number,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  reason: String
}, {
  timestamps: true
});

// Create compound index
lightStateSchema.index({ floor: 1, room: 1 });
lightStateSchema.index({ deviceId: 1 });

module.exports = mongoose.model('LightState', lightStateSchema);

