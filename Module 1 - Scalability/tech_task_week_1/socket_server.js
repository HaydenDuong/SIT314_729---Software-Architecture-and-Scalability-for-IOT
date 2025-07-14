//socket_server.py
const net = require("net");

const port = 5000;

let clientCount = 0;

const server = net.createServer((socket) => {

    const clientIP = socket.remoteAddress;
    const clientPort = socket.remotePort;
    const clientId = ++clientCount;
    
    socket.on("data", (data) => {
        const strData = data.toString().trim();
        console.log(`Client ${clientId} connected from: ${clientIP}:${clientPort} | sent: ${strData}`);

        const command = strData.split(",");
        const operator = command[0];
        const operand1 = parseFloat(command[1]);
        const operand2 = parseFloat(command[2]);
        let result;

        switch (operator) {
            case "add":
                result = operand1 + operand2;
                break;
            case "sub":
                result = operand1 - operand2;
                break;
            case "mul":
                result = operand1 * operand2;
                break;
            case "div":
                if (operand2 === 0) {
                    result = "Error: Division by zero";
                } else {
                    result = operand1 / operand2;
                }
                break;
        }

        // Display the result in the server-side console
        console.log(`Calculation Result: ${result.toString()}\n`);

        // Send the result back to the client-side
        socket.write(result.toString() + "\n");
    });

    socket.on("end", () => {
        console.log(`Client ${clientId}:${clientPort} disconnected`);
    });

    socket.on("error", (error) => {
        console.log(`Client ${clientId} error: ${error.message}`);
    });
});

server.listen(port, "0.0.0.0", () => {  // Listen on all interfaces
    console.log(`TCP socket server is running on port: ${port}. Access via:
        - Local: 127.0.0.1:${port}
        - LAN: 10.141.30.194:${port}`);
});