//socket_client.py
const { randomInt } = require("crypto");
const net = require("net");

const host = "127.0.0.1";
const port = 5000;

const client = net.createConnection(port, host, () => {
    console.log("Connected");

    const a = randomInt(0, 10);
    const b = randomInt(0, 10);
    const commands = ["add", "sub", "mul", "div"];
    const operator = commands[randomInt(0, commands.length)];

    console.log(`Random numbers generated: ${a}, ${b}`);
    console.log(`Operator selected: ${operator}`);

    // client.write(`add,${a},${b}`);
    // client.write(`sub,${a},${b}`);
    // client.write(`mul,${a},${b}`);
    // client.write(`div,${a},${b}`);

    client.write(`${operator},${a},${b}`);
});

client.on("data", (data) => {
    console.log(`Received: ${data}`);
    process.exit(0);
});

client.on("error", (error) => {
    console.log(`Error: ${error.message}`);
});

client.on("close", () => {
    console.log("Connection closed");
});