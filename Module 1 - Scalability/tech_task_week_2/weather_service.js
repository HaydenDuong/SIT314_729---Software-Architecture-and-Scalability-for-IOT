// weather_service.js
// This code implements a TCP socket server that listens for weather data updates
// and responds to requests for weather conditions.
const net = require("net");
const port = 6000;

// Initialize variables to store weather data
let temp;
let wind;
let rain;
let fireWarningLevels = {};

// Create a TCP server
const server = net.createServer((socket) => {
    console.log("Client connected");

    // Set the encoding for the socket
    socket.on("data", (data) => {
        const strData = data.toString().trim();
        //console.log(`Received: ${strData}`);

        const firstCommaIndex = strData.indexOf(",");

        if (firstCommaIndex === -1) {
            console.error("Invalid command format: No comma found.");
            socket.write("error");
            return;
        }

        const name = strData.substring(0, firstCommaIndex);
        const rawCommandValue = strData.substring(firstCommaIndex + 1);
    
        // Process the command based on the name
        switch (name) {
            case "temp":
                temp = parseFloat(rawCommandValue);
                console.log(name + " : " + temp);
		        result = "ok";
                break;

            case "rain":
                rain = parseFloat(rawCommandValue);
                console.log(name + " : " + rain);
                result = "ok";
                break;

            case "wind":
                wind = parseFloat(rawCommandValue);
                console.log(name + " : " + wind);
		        result = "ok";
                break;

            case "fire":
                try {
                    fireWarningLevels = JSON.parse(rawCommandValue);
                    console.log("Received Fire Warning Levels:", fireWarningLevels);
                    result = "ok";
                } catch (error) {
                    console.error("Error parsing fire warning levels:", error);
                    result = "error";
                }
                break;

            case "request":
                const requestedArea = rawCommandValue;
                console.log(`Request for weather conditions in area: ${requestedArea}`);
                const currentFireWarning = fireWarningLevels[requestedArea] || "NO DATA";
                
                // Respond with the current weather conditions
		        if(temp > 20 && rain < 50 && wind > 30){
		            result = `Weather Warning. Fire Warning Level: ${currentFireWarning}`;
		        } 
                else {
                    result = `Everything is fine. Fire Warning Level: ${currentFireWarning}`;
                }
                break;
        }

        // Send the result back to the client
        socket.write(result.toString());
    });

    // Handle socket end event
    socket.on("end", () => {
        console.log("Client disconnected");
    });

    // Handle socket error event
    socket.on("error", (error) => {
        console.log(`Socket Error: ${error.message}`);
    });
});

// Handle server errors
server.on("error", (error) => {
    console.log(`Server Error: ${error.message}`);
});

// Start the server and listen on the specified port
server.listen(port, () => {
    console.log(`TCP socket server is running on port: ${port}`);
});