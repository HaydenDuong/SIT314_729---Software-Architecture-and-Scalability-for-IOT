const mongoose = require('mongoose');
const serveraddress = 'mongodb+srv://tamlac20121996:PuIDWhd25HIqpj07@sit314.tchyumf.mongodb.net';
const Sensor = require('./models/sensor'); 

const express = require('express');
const app = express();
const port = 3000;

mongoose.connect(serveraddress);


//all the sensor Readings in MongoDB
app.get('/', async function (req, res) {
    const filter = {};//get all documents.
    const all = await Sensor.find(filter);
    res.send(all); //send the documents back to the client.
});

//all the sensor Readings with an ID in MongoDB
app.get('/:id', async function (req, res) {
    const filter = {_id: req.params.id};//get documents by ID.
    const all = await Sensor.find(filter);
    res.send(all); //send the documents back to the client.
});

//submit a new value
app.post('/', async function (req, res) {

    //Generate a temperature value.
    const low = 10;
    const high = 40;
    reading = Math.floor(Math.random() * (high - low) + low);

    //Create a new sensor reading.
    const newSensor = new Sensor({
  name: "temperaturesensor",
  address: "221 Burwood Hwy, Burwood VIC 3125",
  time: Date.now(),
  temperature: reading
    });

    newSensor.save().then(doc => {
  console.log("Saving Sensor reading to Database");
  console.log(doc);
    }).then(() => {
    });
  res.end('Added Data!');//return back to the client.
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});