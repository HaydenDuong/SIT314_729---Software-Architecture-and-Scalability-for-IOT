// log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    eventType: { type: String, required: true },
    sensorData: Object,
    action: String,
    newHVACSettings: Object,
    message: String
});

module.exports = mongoose.model('log', logSchema);