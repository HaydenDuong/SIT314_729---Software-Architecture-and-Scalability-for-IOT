// temperature_node.js
// This code implements a TCP socket client that sends temperature data to a server
// and listens for responses.
const net = require("net");

const host = "127.0.0.1";
const port = 6000;

// Create a TCP client that connects to the server
const client = net.createConnection(port, host, () => {
    console.log("Connected");

    const temp = Math.floor(Math.random() * 40) + 1;
	client.write(`temp,`+temp);

    // Set the encoding for the client
    //setInterval(() => {
	//    const temp = Math.floor(Math.random() * 40) + 1;
	//    client.write(`temp,`+temp);
    //}, 2000);
});

// Handle incoming data from the server
client.on("data", (data) => {
    console.log(`Received: ${data}`);
});

// Handle socket error event
client.on("error", (error) => {
    console.log(`Error: ${error.message}`);
});

// Handle socket end even
client.on("close", () => {
    console.log("Connection closed");
});