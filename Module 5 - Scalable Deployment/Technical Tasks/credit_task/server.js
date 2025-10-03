// server.js
const express = require('express');
const mongoose = require('mongoose');

const Sensor = require('./sensor'); 

const app = express();
const port = 3000;

// Middleware to parse incoming JSON data
app.use(express.json());

// MongoDB Atlas connection string
const serveraddress = 'mongodb+srv://tamlac20121996:PuIDWhd25HIqpj07@sit314.tchyumf.mongodb.net/sit314';

// Connect to MongoDB
mongoose.connect(serveraddress)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB Atlas...', err));

// Health check endpoint for the Load Balancer
app.get('/health', (req, res) => {
  res.status(200).send('API is healthy');
});

// GET all sensor readings
app.get('/', async (req, res) => {
  try {
    const all = await Sensor.find({});
    res.send(all);
  } catch (err) {
    res.status(500).send({ message: 'Error retrieving sensor data', error: err });
  }
});

// GET sensor reading by ID
app.get('/:id', async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) return res.status(404).send('Sensor with the given ID was not found.');
    res.send(sensor);
  } catch (err) {
    res.status(500).send({ message: 'Error retrieving sensor data by ID', error: err });
  }
});

// POST a new sensor reading
app.post('/', async (req, res) => {
  try {
    // Read the data from the request body
    const newSensor = new Sensor({
      name: req.body.name,
      address: req.body.address,
      time: req.body.time,
      temperature: req.body.temperature
    });

    const result = await newSensor.save();
    console.log("Saving Sensor reading to Database");
    console.log(result);
    res.status(201).send(result);
  } catch (err) {
    res.status(400).send({ message: 'Invalid data provided', error: err });
  }
});

// PUT to update an existing sensor reading
app.put('/:id', async (req, res) => {
    try {
        const updatedSensor = await Sensor.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            address: req.body.address,
            time: req.body.time,
            temperature: req.body.temperature
        }, { new: true });
        
        if (!updatedSensor) return res.status(404).send('Sensor with the given ID was not found.');
        res.send(updatedSensor);
    } catch (err) {
        res.status(400).send({ message: 'Error updating sensor data', error: err });
    }
});

// DELETE a sensor reading
app.delete('/:id', async (req, res) => {
    try {
        const sensor = await Sensor.findByIdAndDelete(req.params.id);
        if (!sensor) return res.status(404).send('Sensor with the given ID was not found.');
        res.status(200).send(sensor);
    } catch (err) {
        res.status(500).send({ message: 'Error deleting sensor data', error: err });
    }
});


app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});