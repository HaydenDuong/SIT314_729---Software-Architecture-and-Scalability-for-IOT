// smoke_sensor.js
// This module defines a SmokeSensor class that simulates a smoke sensor device.
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

const topic = '/forest/sensors/smoke';

//const smoke_sensor_ids = ['smoke_sensor_1', 'smoke_sensor_2', 'smoke_sensor_3'];
//const smoke_topics = smoke_sensor_ids.map(id => `/forest/sensors/smoke/${id}`);

client.on('connect', () => {

    console.log('mqtt connected');

    setInterval(function() {

        //smoke_topics.forEach(topic => {

            const smokeLevel = Math.floor(Math.random() * 101); // Random smoke level between 0 and 100

            const message = JSON.stringify({ level: smokeLevel });

            client.publish(topic, message);
            console.log(`Published to Topic ${topic} with Message: ${message}`);

        //}); 
    }, 2000);
});
