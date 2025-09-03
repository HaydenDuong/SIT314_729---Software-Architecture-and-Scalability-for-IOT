let request = require('request');

let url = `http://localhost:3000/sensorData`;

request(url, function (error, response, body) {
if(error){
    console.log('error:', error);
} else {
    let sensorData = JSON.parse(body);
    console.log(sensorData);
    console.log(`Sensor ID: ${sensorData.id}`);
    console.log(`Sensor Name: ${sensorData.name}`);
    console.log(`Sensor Address: ${sensorData.address}`);
    console.log(`Timestamp: ${new Date(sensorData.time).toLocaleString()}`);
    console.log(`Temperature: ${sensorData.temperature}°C`);
}
});