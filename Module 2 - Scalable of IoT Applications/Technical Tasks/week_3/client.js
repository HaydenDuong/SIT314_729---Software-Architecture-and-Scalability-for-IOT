// client.js
// This code connects to an MQTT broker and publishes a message to a specified topic.
// It uses the 'mqtt' library to handle the connection and publishing.
const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define the topic and message to be published
var topic="/myid";
var message="My message";

// Set up the event listener for when the client connects to the broker
client.on('connect', () => 
{
    console.log('mqtt connected');
    client.publish(topic, message);
    console.log('published to Topic: ' + topic + " with Message: " + message);
}); 
