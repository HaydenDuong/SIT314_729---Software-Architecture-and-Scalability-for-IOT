// api.js
// This file sets up the backend API for the weather service.
// It uses Express for routing, Mongoose for MongoDB interaction, and weather-js for external API calls.

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const weather = require('weather-js');

const app = express();
const PORT = 3000;

// --- Middleware ---

app.use(cors());
app.use(bodyParser.json());

// --- MongoDB Connection ---
// NOTE: Using a hardcoded URI for demonstration purposes. In a real application, use environment variables.
const mongoUri = 'mongodb+srv://tamlac20121996:PuIDWhd25HIqpj07@sit314.tchyumf.mongodb.net';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// --- Import Mongoose Models ---
// Corrected import to match the 'LastestReading.js' filename.
const WeatherReading = require('./models/WeatherReading.js');
const LatestReading = require('./models/LastestReading.js');

// --- API Endpoints (CRUD Operations) ---

// 1. CREATE: Submit a new sensor reading
app.post('/api/weather', async (req, res) => {
    try {
        // Corrected 'longtitude' field to 'longitude' to match the client input and the updated schema.
        const { temperature, humidity, latitude, longitude } = req.body;
        if (temperature === undefined || humidity === undefined || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: 'Missing required fields: temperature, humidity, latitude, longitude' });
        }

        const newReading = new WeatherReading({ temperature, humidity, location: { latitude, longitude } });
        await newReading.save();

        // Update the single latest reading document
        // Use findOneAndUpdate with upsert: true to create the document if it doesn't exist.
        await LatestReading.findOneAndUpdate({}, { temperature, timestamp: newReading.timestamp }, {
            upsert: true,
            new: true
        });

        res.status(201).json({ message: 'Sensor reading submitted successfully', data: newReading });
    } catch (error) {
        // Log the full error to help with debugging
        console.error('Error submitting reading:', error);
        res.status(500).json({ message: 'Error submitting reading', error: error.message });
    }
});

// 2. READ: Get all weather readings
app.get('/api/weather', async (req, res) => {
    try {
        const readings = await WeatherReading.find().sort({ timestamp: -1 });
        res.status(200).json(readings);
    } catch (error) {
        console.error('Error retrieving readings:', error);
        res.status(500).json({ message: 'Error retrieving readings', error: error.message });
    }
});

// 3. READ: Get the latest temperature reading
app.get('/api/weather/latest', async (req, res) => {
    try {
        const latest = await LatestReading.findOne();
        if (!latest) {
            return res.status(404).json({ message: 'No latest reading found' });
        }
        res.status(200).json(latest);
    } catch (error) {
        console.error('Error retrieving latest reading:', error);
        res.status(500).json({ message: 'Error retrieving latest reading', error: error.message });
    }
});

// 4. READ: Get weather data for a specific map location using weather-js
app.get('/api/weather/location/:place', (req, res) => {
    const { place } = req.params;
    weather.find({ search: place, degreeType: 'C' }, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error retrieving weather data for location' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Location not found' });
        }
        res.status(200).json(result[0]);
    });
});

// 5. UPDATE: Update a specific reading by ID
app.put('/api/weather/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedReading = await WeatherReading.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedReading) {
            return res.status(404).json({ message: 'Reading not found' });
        }

        // Check if the updated reading is the latest one
        const latest = await LatestReading.findOne();
        if (latest && latest.timestamp <= updatedReading.timestamp) {
            latest.temperature = updatedReading.temperature;
            latest.timestamp = updatedReading.timestamp;
            await latest.save();
        }

        res.status(200).json({ message: 'Reading updated successfully', data: updatedReading });
    } catch (error) {
        console.error('Error updating reading:', error);
        res.status(500).json({ message: 'Error updating reading', error: error.message });
    }
});

// 6. DELETE: Delete a specific reading by ID
app.delete('/api/weather/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReading = await WeatherReading.findByIdAndDelete(id);
        if (!deletedReading) {
            return res.status(404).json({ message: 'Reading not found' });
        }

        // You might need to re-evaluate the latest reading if the deleted one was the latest
        // For simplicity, this example doesn't handle that edge case.
        res.status(200).json({ message: 'Reading deleted successfully', data: deletedReading });
    } catch (error) {
        console.error('Error deleting reading:', error);
        res.status(500).json({ message: 'Error deleting reading', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
