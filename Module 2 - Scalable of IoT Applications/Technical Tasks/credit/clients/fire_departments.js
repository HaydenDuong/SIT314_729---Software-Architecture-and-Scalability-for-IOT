// fire_departments.js
// This module defines a FireDepartments class that simulates a fire department client.
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

const topic = '/alert/fire_departments';

client.on('connect', () => {
    client.subscribe(topic);
    console.log('Fire Department Client connected and subscribed to topic:', topic);
});

client.on('message', (topic, message) => {
    console.log(`Fire Department Client received message on topic ${topic}: ${message.toString()}`);
});