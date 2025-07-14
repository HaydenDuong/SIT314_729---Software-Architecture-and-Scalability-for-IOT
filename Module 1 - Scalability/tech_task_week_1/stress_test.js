const { randomInt } = require("crypto");
const net = require("net");

// const host = "192.168.4.22";
const host = "10.141.30.194";
const port = 5000;
const numClients = 3; // Adjust this number to control the number of clients (max 17000)

// Create a map to store client commands (key: client ID, value: command)
const clientCommands = new Map();

for (let i = 1; i <= numClients; i++) {
    const client = net.createConnection(port, host, () => {
        // Log the connection to the console
        // Display the client ID and server address in the client-side console
        console.log(`Client ${i} connected to server at ${host}:${port}`);

        // Generate a random command for the client
        // Command format: "operator,operand1,operand2"
        // Operators: add, sub, mul, div
        // Operands: random integers between 0 and 10
        // Example command: "add,5,3"
        const a = randomInt(0, 10);
        const b = randomInt(0, 10);
        const operator = ["add", "sub", "mul", "div"][randomInt(0, 4)];
        const command = `${operator},${a},${b}`;
        
        // Store the command in the map
        // Allow the tracking of which command was sent by each client
        clientCommands.set(i, command);

        // Send the command to the server-side
        client.write(`${command}\n`);
    });

    // Handle server response
    client.on("data", (data) => {

        // Convert the received data to a string and trim whitespace
        const result = data.toString().trim();

        // Log the result to the console
        // Display the result in the client-side console
        console.log(`Client ${i} sent: ${clientCommands.get(i)} | received: ${result}\n`);

        // Close the client connection after receiving the response
        client.end();
    });
}