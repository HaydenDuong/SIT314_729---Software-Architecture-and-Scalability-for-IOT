// latestReading.js
const mongoose = require('mongoose');

// This schema is specifically for storing the single latest temperature reading
const latestReadingSchema = new mongoose.Schema({
  temperature: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
});

module.exports = mongoose.model('latest_reading', latestReadingSchema);