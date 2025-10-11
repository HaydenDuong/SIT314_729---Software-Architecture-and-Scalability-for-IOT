const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const mqtt = require('mqtt');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Service URLs
const SENSOR_DATA_SERVICE = process.env.SENSOR_DATA_SERVICE || 'http://localhost:3001';
const LIGHT_CONTROL_SERVICE = process.env.LIGHT_CONTROL_SERVICE || 'http://localhost:3002';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (for storing rules in future)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iot_smart_lighting';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Automation Service: MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Automation Rules Configuration
const AUTOMATION_RULES = {
  LIGHT_THRESHOLD: parseInt(process.env.LIGHT_THRESHOLD) || 200,
  MOTION_TIMEOUT_MS: parseInt(process.env.MOTION_TIMEOUT_MS) || 300000 // 5 minutes
};

console.log('🤖 Automation Rules:', AUTOMATION_RULES);

// MQTT Connection to AWS IoT Core (to listen for sensor data)
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
      clientId: `automation-service-${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
    };

    if (!options.cert || !options.key || !options.ca) {
      console.log('⚠️  Certificates not found. Running without MQTT (API only mode)');
      return;
    }

    mqttClient = mqtt.connect(options);

    mqttClient.on('connect', () => {
      console.log('✅ Automation Service: Connected to AWS IoT Core');
      
      // Subscribe to all sensor topics
      mqttClient.subscribe('iot/sensors/+/+/+', (err) => {
        if (!err) {
          console.log('📡 Subscribed to: iot/sensors/+/+/+');
        }
      });

      mqttClient.subscribe('test/topic', (err) => {
        if (!err) {
          console.log('📡 Subscribed to: test/topic');
        }
      });
    });

    mqttClient.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        await processAutomationRules(data);
      } catch (error) {
        console.error('❌ Error processing automation:', error.message);
      }
    });

    mqttClient.on('error', (error) => {
      console.error('❌ MQTT Error:', error.message);
    });

  } catch (error) {
    console.error('❌ MQTT connection error:', error.message);
  }
}

// Initialize MQTT
connectToMQTT();

// Automation Logic
async function processAutomationRules(sensorData) {
  try {
    const {
      deviceId,
      lightId,
      floor,
      room,
      motion_detected,
      light_intensity,
      ambientLight
    } = sensorData;

    if (!lightId) {
      // If no lightId, generate one
      sensorData.lightId = `floor${floor}-room${room}-${deviceId}-light`;
    }

    const finalLightId = sensorData.lightId;
    const lightLevel = light_intensity || ambientLight || 0;
    const motionDetected = motion_detected || false;

    // Rule: Turn ON if motion detected AND light is low
    // Rule: Turn OFF if no motion OR light is bright
    let desiredState;
    let reason;

    if (motionDetected && lightLevel < AUTOMATION_RULES.LIGHT_THRESHOLD) {
      desiredState = 'ON';
      reason = `Motion detected with low light (${lightLevel} lux)`;
    } else if (!motionDetected) {
      desiredState = 'OFF';
      reason = 'No motion detected';
    } else if (lightLevel >= AUTOMATION_RULES.LIGHT_THRESHOLD) {
      desiredState = 'OFF';
      reason = `Sufficient ambient light (${lightLevel} lux)`;
    } else {
      desiredState = 'OFF';
      reason = 'Default state';
    }

    // Call Light Control Service to update state
    const response = await axios.post(`${LIGHT_CONTROL_SERVICE}/api/lights/state`, {
      lightId: finalLightId,
      deviceId: deviceId || 'unknown',
      floor,
      room,
      desiredState,
      reason,
      lastMotionDetected: motionDetected,
      lastLightIntensity: lightLevel
    });

    if (response.data.stateChanged) {
      console.log(`🤖 Automation: ${finalLightId} → ${desiredState} (${reason})`);
    }

    return response.data;
  } catch (error) {
    console.error('❌ Automation processing error:', error.message);
    throw error;
  }
}

// REST API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'automation-service',
    mqtt: mqttClient ? mqttClient.connected : false,
    mongodb: mongoose.connection.readyState === 1
  });
});

// POST: Manually trigger automation for sensor data
app.post('/api/automation/process', async (req, res) => {
  try {
    const result = await processAutomationRules(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Get automation rules configuration
app.get('/api/automation/rules', (req, res) => {
  res.json({
    success: true,
    rules: AUTOMATION_RULES
  });
});

// PUT: Update automation rules
app.put('/api/automation/rules', (req, res) => {
  const { LIGHT_THRESHOLD, MOTION_TIMEOUT_MS } = req.body;
  
  if (LIGHT_THRESHOLD) AUTOMATION_RULES.LIGHT_THRESHOLD = LIGHT_THRESHOLD;
  if (MOTION_TIMEOUT_MS) AUTOMATION_RULES.MOTION_TIMEOUT_MS = MOTION_TIMEOUT_MS;

  res.json({
    success: true,
    message: 'Automation rules updated',
    rules: AUTOMATION_RULES
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Automation Service running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Automation Service...');
  if (mqttClient) mqttClient.end();
  await mongoose.connection.close();
  process.exit(0);
});

