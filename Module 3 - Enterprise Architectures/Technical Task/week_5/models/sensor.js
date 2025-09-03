// models/sensor.js
const mongoose = require('mongoose');

module.exports = mongoose.model('Sensor', new mongoose.Schema({
  id: Number,
  name: String,
  address: String,
  time: Date,
  temperature: Number
}), 'sensors'); // 'sensors' is the collection name in MongoDB or can be any preferred name