// roomSensorNodes.js
// This file defines the sensor nodes for a room in a home automation system.
const { generateSensorData } = require('./sensorSimulator');
const axios = require('axios');

const edgeNodeUrl = 'http://localhost:3000/sensor-data';

const sendDataToEdgeNode = async () => {
    
    const sensorData = generateSensorData();

    console.log('Sending sensor data to edge node:', sensorData);

    try {
        const response = await axios.post(edgeNodeUrl, sensorData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response from edge node:', response.data);
    } catch (error) {
        console.error('Error sending data to edge node:', error.message);
    }
};

// Simulate sending data every 5 seconds
setInterval(sendDataToEdgeNode, 5000);