// wind_node.js
// This code implements a TCP socket client that sends wind data to a server
// and listens for responses.
const net = require("net");

const host = "127.0.0.1";
const port = 6000;

// Create a TCP client that connects to the server
const client = net.createConnection(port, host, () => {
    console.log("Connected");

    const wind = Math.floor(Math.random() * 100) + 1;
	client.write(`wind,`+wind);

    // Set the encoding for the client
    //setInterval(() => {
    //    const wind = Math.floor(Math.random() * 100) + 1;
	//    client.write(`wind,`+wind);
    //}, 300000); // Interval in milliseconds (2000ms = 2 seconds)
});

// Handle incoming data from the server
client.on("data", (data) => {
    console.log(`Received: ${data}`);
});

// Handle socket error event
client.on("error", (error) => {
    console.log(`Error: ${error.message}`);
});

// Handle socket end event
client.on("close", () => {
    console.log("Connection closed");
});