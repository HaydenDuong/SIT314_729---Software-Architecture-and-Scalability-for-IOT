// warning_request.js
// This code implements a TCP socket client that sends a request for weather conditions
// and listens for responses from the server.
const net = require("net");

const host = "127.0.0.1";
const port = 6000;

// Specify the area for which to request weather conditions
// List of areas can be defined based on the fire warning levels: 
// Central, East Gippsland, Mallee, North Central, North East, Northern Country, South West, West and South Gippsland, Wimmera
const areas = [
    "Central",
    "East Gippsland",
    "Mallee",
    "North Central",
    "North East",
    "Northern Country",
    "South West",
    "West and South Gippsland",
    "Wimmera"
];
// const areaToRequest = "Central"; // Specify the area for which to request weather conditions

// Create a TCP client that connects to the server
const client = net.createConnection(port, host, () => {
    console.log("Connected to Weather Service");

    // Set the encoding for the client
    setInterval(() => {
        const areaToRequest = areas[Math.floor(Math.random() * areas.length)]; // Randomly select an area from the list
	    client.write(`request,${areaToRequest}`);
        console.log(`Sent request for weather conditions in area: request,${areaToRequest}`);
    }, 2000); // Interval in milliseconds (2000ms = 2 seconds)
});

// Handle incoming data from the server
client.on("data", (data) => {
    console.log(`Received: ${data.toString()}`);
//    process.exit(0);
});

// Handle socket error event
client.on("error", (error) => {
    console.log(`Error: ${error.message}`);
});

// Handle socket end event
client.on("close", () => {
    console.log("Connection closed");
});