// social_media.js
// This module defines a SocialMedia class that simulates a social media client.
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

const topic = '/alert/social_media';

client.on('connect', () => {
    client.subscribe(topic);
    console.log('Social Media Client connected and subscribed to topic:', topic);
});

client.on('message', (topic, message) => {
    console.log(`Social Media Client received message on topic ${topic}: ${message.toString()}`);
});