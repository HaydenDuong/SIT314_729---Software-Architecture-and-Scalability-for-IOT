const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  deviceType: {
    type: String,
    default: 'ambient_light_sensor'
  },
  location: {
    type: String,
    required: false
  },
  floor: {
    type: Number,
    index: true
  },
  room: {
    type: Number,
    index: true
  },
  lightId: String,
  ambientLight: Number,
  light_intensity: Number,
  motion_detected: Boolean,
  unit: String,
  batteryLevel: Number,
  signalStrength: Number,
  timeOfDay: String,
  weather: String,
  readingQuality: String,
  errorCount: Number,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  timestampISO: String
}, {
  timestamps: true
});

// Create compound index for efficient queries
sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });
sensorReadingSchema.index({ floor: 1, room: 1, timestamp: -1 });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);

