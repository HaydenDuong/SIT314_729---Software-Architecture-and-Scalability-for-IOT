// iotsensor.js
// This script simulates a temperature sensor reading and saves it to a MongoDB database.
const mongoose = require('mongoose');

setInterval(sensortest, 1000); // time is in ms

function sensortest() 
{
    const Sensor = require('./models/sensor');

    // Simulated sensor data
    const sensordata = {
        id: 0,
        name: "temperature_sensor",
        address: "221 Burwood Hwy, Burwood, VIC 3125",
        time: Date.now(),
        temperature: null
    }

    // Generate a random temperature reading between 10 and 40 degrees Celsius
    const low = 10;
    const high = 40;
    reading = Math.floor(Math.random() * (high - low) + low);
    sensordata.temperature = reading;

    startTime = Date.now();

    // Connect to MongoDB
    // Can be checked MongoDB Atlas website
    // or MongoDB Compass (through URI)
    mongoose.connect('mongodb+srv://tamlac20121996:PuIDWhd25HIqpj07@sit314.tchyumf.mongodb.net')

    // jsonify the sensor data
    const jsonString = JSON.stringify(sensordata);
    console.log(jsonString);

    // Create a new sensor document based on "sensordata" above 
    // and store its properties under the Sensor model (defined in models/sensor.js)
    const newSensor = new Sensor({
            id: sensordata.id,
            name: sensordata.name,
            address: sensordata.address,
            time: sensordata.time,
            temperature: sensordata.temperature
        });

    // Save the new sensor document to the database
    newSensor.save().then(doc => {
        endTime = Date.now();
        console.log(endTime - startTime + " ms");
        console.log(doc);
        }).then(() => {
        //mongoose.connection.close();
    });
}

