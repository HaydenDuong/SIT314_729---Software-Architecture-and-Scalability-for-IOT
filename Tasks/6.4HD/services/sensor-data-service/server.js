const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mqtt = require('mqtt');
const fs = require('fs');
require('dotenv').config();

const SensorReading = require('./models/SensorReading');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iot_smart_lighting';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Sensor Data Service: MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// MQTT Connection to AWS IoT Core
let mqttClient = null;

function connectToMQTT() {
  try {
    const certPath = process.env.CERT_PATH || '../certificates/light_sensor.cert.pem';
    const keyPath = process.env.KEY_PATH || '../certificates/light_sensor.private.key';
    const caPath = process.env.CA_PATH || '../certificates/root-CA.crt';
    const iotHost = process.env.IOT_HOST || 'a3gihr6flc6bqc-ats.iot.ap-southeast-2.amazonaws.com';

    const options = {
      host: iotHost,
      port: 8883,
      protocol: 'mqtts',
      cert: fs.existsSync(certPath) ? fs.readFileSync(certPath) : null,
      key: fs.existsSync(keyPath) ? fs.readFileSync(keyPath) : null,
      ca: fs.existsSync(caPath) ? fs.readFileSync(caPath) : null,
      clientId: `sensor-data-service-${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
    };

    if (!options.cert || !options.key || !options.ca) {
      console.log('⚠️  Certificates not found. Running without MQTT connection (API only mode)');
      return;
    }

    mqttClient = mqtt.connect(options);

    mqttClient.on('connect', () => {
      console.log('✅ Sensor Data Service: Connected to AWS IoT Core');
      
      // Subscribe to all sensor topics
      mqttClient.subscribe('iot/sensors/+/+/+', (err) => {
        if (!err) {
          console.log('📡 Subscribed to: iot/sensors/+/+/+');
        } else {
          console.error('❌ Subscribe error:', err);
        }
      });

      // Also subscribe to test topic
      mqttClient.subscribe('test/topic', (err) => {
        if (!err) {
          console.log('📡 Subscribed to: test/topic');
        }
      });
    });

    mqttClient.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Save to MongoDB
        const reading = new SensorReading(data);
        await reading.save();
        
        console.log(`💾 Stored reading from ${data.deviceId || 'unknown'}`);
      } catch (error) {
        console.error('❌ Error processing message:', error.message);
      }
    });

    mqttClient.on('error', (error) => {
      console.error('❌ MQTT Error:', error.message);
    });

    mqttClient.on('offline', () => {
      console.log('📴 MQTT Client offline');
    });

  } catch (error) {
    console.error('❌ MQTT connection error:', error.message);
  }
}

// Initialize MQTT connection
connectToMQTT();

// REST API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'sensor-data-service',
    mqtt: mqttClient ? mqttClient.connected : false,
    mongodb: mongoose.connection.readyState === 1
  });
});

// POST: Store sensor reading (for direct API calls)
app.post('/api/sensor-readings', async (req, res) => {
  try {
    const reading = new SensorReading(req.body);
    await reading.save();
    res.status(201).json({ success: true, data: reading });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET: Retrieve sensor readings with filtering
app.get('/api/sensor-readings', async (req, res) => {
  try {
    const { deviceId, floor, room, limit = 100, skip = 0 } = req.query;
    
    const query = {};
    if (deviceId) query.deviceId = deviceId;
    if (floor) query.floor = parseInt(floor);
    if (room) query.room = parseInt(room);

    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await SensorReading.countDocuments(query);

    res.json({ 
      success: true, 
      count: readings.length,
      total,
      data: readings 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Latest reading for a device
app.get('/api/sensor-readings/latest/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const reading = await SensorReading.findOne({ deviceId })
      .sort({ timestamp: -1 });

    if (!reading) {
      return res.status(404).json({ 
        success: false, 
        error: 'No readings found for this device' 
      });
    }

    res.json({ success: true, data: reading });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Statistics
app.get('/api/sensor-readings/stats', async (req, res) => {
  try {
    const totalReadings = await SensorReading.countDocuments();
    const uniqueDevices = await SensorReading.distinct('deviceId');
    const latestReading = await SensorReading.findOne().sort({ timestamp: -1 });

    res.json({
      success: true,
      stats: {
        totalReadings,
        uniqueDevices: uniqueDevices.length,
        devices: uniqueDevices,
        latestReading: latestReading ? latestReading.timestamp : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Clear all readings (for testing)
app.delete('/api/sensor-readings', async (req, res) => {
  try {
    const result = await SensorReading.deleteMany({});
    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} readings` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sensor Data Service running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Sensor Data Service...');
  if (mqttClient) mqttClient.end();
  await mongoose.connection.close();
  process.exit(0);
});

