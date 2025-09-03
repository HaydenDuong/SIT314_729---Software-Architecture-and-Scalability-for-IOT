// server.js
// This code connects to an MQTT broker and listens for messages on a specified topic.
const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Define the topic to subscribe to
var topic = "/myid";

// Set up the event listener for when the client connects to the broker
// Subscribe to the topic and log messages received
client.on('connect', () => 
{
    client.subscribe(topic);
    console.log('mqtt connected');
});

client.on('message', (topic, message) => 
{
    console.log("Topic is: " + topic);
    console.log("Message is: " + message);
});