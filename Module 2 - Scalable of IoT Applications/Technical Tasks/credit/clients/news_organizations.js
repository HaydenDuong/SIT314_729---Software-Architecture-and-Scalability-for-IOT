// news_organizations.js
// This module defines a NewsOrganizations class that simulates a news organization client.
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

const topic = '/alert/news_organizations';

client.on('connect', () => {
    client.subscribe(topic);
    console.log('News Organization Client connected and subscribed to topic:', topic);
});

client.on('message', (topic, message) => {
    console.log(`News Organization Client received message on topic ${topic}: ${message.toString()}`);
});