// client.js
const axios = require('axios');

// The URL consists of the load balancer DNS name and the port number
const baseURL = `http://module5-creditTask-LB-1431172691.us-east-1.elb.amazonaws.com:3000`;

// Function to send POST request with sensor data
// The sensor data includes name, address, current time, and a random temperature between 10 and 40
const postSensorData = async () => {
  const newSensorData = {
    name: "temperaturesensor",
    address: "221 Burwood Hwy, Burwood VIC 3125",
    time: new Date(),
    temperature: Math.floor(Math.random() * (40 - 10) + 10)
  };

  try {
    const response = await axios.post(baseURL, newSensorData);
    console.log(`\n--- POST Success ---`);
    console.log(`Status: ${response.status} - Sent data to Load Balancer.`);
  } catch (error) {
    console.log(`\n--- POST Error ---`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${error.response.data}`);
    } else {
      console.log(`Request error: ${error.message}`);
    }
  }
};

// Set an interval to send POST requests every 2 seconds
const interval = 2000; // 2000 ms = 2 seconds
console.log(`Starting to send POST requests to the Load Balancer every ${interval / 1000} seconds...`);
setInterval(postSensorData, interval);