// heat_sensor.js
// This module defines a HeatSensor class that simulates a heat sensor device.
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

const topic = '/forest/sensors/heat';

//const heat_sensor_ids = ['heat_sensor_1', 'heat_sensor_2', 'heat_sensor_3'];
//const heat_topics = heat_sensor_ids.map(id => `/forest/sensors/heat/${id}`);

client.on('connect', () => {

    console.log('mqtt connected');

    setInterval(function() {

        //heat_topics.forEach(topic => {

            const heatLevel = Math.floor(Math.random() * 101); // Random heat level between 0 and 100

            const message = JSON.stringify({ level: heatLevel });

            client.publish(topic, message);

            console.log(`Published to Topic ${topic} with Message: ${message}`);

        //}); 
    }, 2000);
});