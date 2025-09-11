const mongoose = require('mongoose');

const weatherReadingSchema = new mongoose.Schema({

    temperature: {
        type: Number,
        required: true
    },

    humidity: {
        type: Number,
        required: true
    },
    
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },

    location: {
        latitude: {
            type: Number,
            required: true,
        },
        // Corrected spelling from 'longtitude' to 'longitude'
        longitude: {
            type: Number,
            required: true,
        }
    }

});

module.exports = mongoose.model('weather_reading', weatherReadingSchema);
