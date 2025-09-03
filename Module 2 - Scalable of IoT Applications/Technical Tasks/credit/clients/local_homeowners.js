// local_homeowners.js
// This module defines a LocalHomeowners class that simulates a local homeowner client.
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

const topic = '/alert/local_homeowners';

client.on('connect', () => {
    client.subscribe(topic);
    console.log('Local Homeowners Client connected and subscribed to topic:', topic);
});

client.on('message', (topic, message) => {
    console.log(`Local Homeowners Client received message on topic ${topic}: ${message.toString()}`);
});
