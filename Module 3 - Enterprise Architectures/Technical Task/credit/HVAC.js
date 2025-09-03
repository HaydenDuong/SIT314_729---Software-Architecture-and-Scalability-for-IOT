// hvacNode.js

// Import the Express module
const express = require('express');
const app = express();
const port = 3001; // Use a different port than the edge node (port 3000)

// Middleware to handle JSON payloads from the edge node
app.use(express.json());

// --- API Endpoint ---
// This is the endpoint that the edge node will call to set HVAC settings.
app.post('/set-hvac', (req, res) => {
    // Extract the settings from the request body
    const { mode, temperatureSetPoint } = req.body;

    console.log('--- HVAC Node: Received new settings ---');
    console.log(`Mode: ${mode}`);
    if (temperatureSetPoint) {
        console.log(`Temperature Set Point: ${temperatureSetPoint}°C`);
    }
    console.log('HVAC system is now being configured.');

    // Send a response back to the edge node to confirm receipt
    res.status(200).send({
        message: 'HVAC settings updated successfully.',
        currentSettings: { mode, temperatureSetPoint }
    });
});

// Start the server and listen for incoming requests
app.listen(port, () => {
    console.log(`HVAC node server is running on http://localhost:${port}`);
});