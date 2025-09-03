// sensorSimulator.js
// This file simulates sensor data for a room in a home automation system.

// Function to generate random sensor data
const generateSensorData = () => {
    const temperature = (Math.random() * 15 + 15).toFixed(2); // Simulate temperature between 15°C and 30°C
    const humidity = (Math.random() * 50 + 30).toFixed(2);    // Simulate humidity between 30% and 80%
    const chairUsed = Math.floor(Math.random() * 20);        // Simulate chair usage count between 0 and 20

    const sensorData = {
        temperature: temperature,
        humidity: humidity,
        chairUsed: chairUsed,
        timestamp: new Date().toISOString() // Current timestamp
    }

    return sensorData;
};

module.exports = { generateSensorData };
