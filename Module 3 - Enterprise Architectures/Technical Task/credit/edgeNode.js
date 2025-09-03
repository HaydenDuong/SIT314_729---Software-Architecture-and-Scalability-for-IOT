// edgeNode.js
// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const Log = require('./mongoDB_model/log');
const axios = require('axios');

const app = express();
const port = 3000;

// --- Thêm biến để theo dõi trạng thái hiện tại ---
let currentHVACMode = 'off';
let currentTemperatureSetPoint = null;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Database Connection
const dbURI = 'mongodb+srv://tamlac20121996:PuIDWhd25HIqpj07@sit314.tchyumf.mongodb.net';

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB Atlas successfully.');
})
.catch(err => {
    console.error('Connection error to MongoDB Atlas:', err);
});

// API Endpoint
app.post('/sensor-data', async (req, res) => {
    const { temperature, humidity, chairsUsed } = req.body;

    try {
        const logReceived = new Log({
            eventType: 'requestReceived',
            sensorData: { temperature, humidity, chairsUsed },
            message: 'Received new sensor data.'
        });
        await logReceived.save();
        console.log('Logged sensor data receipt.');
    } catch (err) {
        console.error('Error logging sensor data:', err);
    }

    // --- Cập nhật logic để chỉ thay đổi trạng thái khi cần ---
    let newHVACMode;
    let newTemperatureSetPoint;
    let logMessage;

    if (temperature > 26 || humidity > 50) {
        newHVACMode = 'cooling';
        newTemperatureSetPoint = 23;
        logMessage = 'High temperature or high humidity, changing HVAC to cooling.';
    } else {
        newHVACMode = 'off';
        newTemperatureSetPoint = null;
        logMessage = 'Low temperature or normal humidity, turning off HVAC.';
    }

    // --- Điều kiện để quyết định có gọi HVAC node hay không ---
    if (newHVACMode === currentHVACMode && newTemperatureSetPoint === currentTemperatureSetPoint) {
        // Không có thay đổi, không cần gọi HVAC node
        console.log('HVAC mode unchanged. No action needed.');
        // Ghi log đơn giản rằng không có thay đổi
        const logNoChange = new Log({
            eventType: 'statusUnchanged',
            sensorData: { temperature, humidity, chairsUsed },
            message: 'HVAC settings remain the same as no threshold was crossed.'
        });
        await logNoChange.save();
        return res.status(200).send('HVAC settings are already in the correct state.');
    }
    
    // Nếu có thay đổi, cập nhật trạng thái và gọi HVAC node
    currentHVACMode = newHVACMode;
    currentTemperatureSetPoint = newTemperatureSetPoint;

    // --- Call the HVAC Node ---
    const hvacUrl = 'http://localhost:3001/set-hvac';
    const newHVACSettings = { mode: newHVACMode, temperatureSetPoint: newTemperatureSetPoint };

    try {
        const hvacResponse = await axios.post(hvacUrl, newHVACSettings);
        console.log('Successfully called HVAC node:', hvacResponse.data);
        
        // Log the decision and status change to the database
        const logStatusChange = new Log({
            eventType: 'statusChange',
            sensorData: { temperature, humidity, chairsUsed },
            action: 'HVACSettingsChanged',
            newHVACSettings: newHVACSettings,
            message: logMessage
        });
        await logStatusChange.save();
        console.log('Logged HVAC status change to database.');

        res.status(200).send('HVAC settings updated successfully.');
    } catch (error) {
        console.error('Failed to call HVAC node:', error.message);
        res.status(500).send('Failed to update HVAC settings.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Edge node server is running on http://localhost:${port}`);
});