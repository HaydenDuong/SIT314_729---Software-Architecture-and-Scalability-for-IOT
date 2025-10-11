const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs
const SENSOR_DATA_SERVICE = process.env.SENSOR_DATA_SERVICE || 'http://localhost:3001';
const LIGHT_CONTROL_SERVICE = process.env.LIGHT_CONTROL_SERVICE || 'http://localhost:3002';
const AUTOMATION_SERVICE = process.env.AUTOMATION_SERVICE || 'http://localhost:3003';

console.log('🔗 Service endpoints:');
console.log(`  📊 Sensor Data: ${SENSOR_DATA_SERVICE}`);
console.log(`  💡 Light Control: ${LIGHT_CONTROL_SERVICE}`);
console.log(`  🤖 Automation: ${AUTOMATION_SERVICE}`);

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Helper function to forward requests
async function forwardRequest(serviceUrl, path, method = 'GET', data = null, query = {}) {
  try {
    const url = `${serviceUrl}${path}`;
    const config = {
      method,
      url,
      params: query,
      data
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error forwarding to ${serviceUrl}${path}:`, error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.error || error.message
    };
  }
}

// ===================
// API Gateway Routes
// ===================

// Root health check
app.get('/', (req, res) => {
  res.json({
    message: 'IoT Smart Lighting API Gateway',
    version: '1.0.0',
    services: {
      sensorData: SENSOR_DATA_SERVICE,
      lightControl: LIGHT_CONTROL_SERVICE,
      automation: AUTOMATION_SERVICE
    }
  });
});

// Gateway health check
app.get('/health', async (req, res) => {
  try {
    const healthChecks = await Promise.allSettled([
      axios.get(`${SENSOR_DATA_SERVICE}/health`),
      axios.get(`${LIGHT_CONTROL_SERVICE}/health`),
      axios.get(`${AUTOMATION_SERVICE}/health`)
    ]);

    res.json({
      gateway: 'healthy',
      services: {
        sensorData: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        lightControl: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        automation: healthChecks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// ==========================
// Sensor Data Service Routes
// ==========================

// Get sensor readings
app.get('/api/sensors/readings', async (req, res) => {
  try {
    const data = await forwardRequest(SENSOR_DATA_SERVICE, '/api/sensor-readings', 'GET', null, req.query);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Get latest reading for a device
app.get('/api/sensors/readings/latest/:deviceId', async (req, res) => {
  try {
    const data = await forwardRequest(
      SENSOR_DATA_SERVICE, 
      `/api/sensor-readings/latest/${req.params.deviceId}`, 
      'GET'
    );
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Get sensor statistics
app.get('/api/sensors/stats', async (req, res) => {
  try {
    const data = await forwardRequest(SENSOR_DATA_SERVICE, '/api/sensor-readings/stats', 'GET');
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Create sensor reading (for direct API submission)
app.post('/api/sensors/readings', async (req, res) => {
  try {
    const data = await forwardRequest(SENSOR_DATA_SERVICE, '/api/sensor-readings', 'POST', req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// ============================
// Light Control Service Routes
// ============================

// Get all light states
app.get('/api/lights/states', async (req, res) => {
  try {
    const data = await forwardRequest(LIGHT_CONTROL_SERVICE, '/api/lights/states', 'GET', null, req.query);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Get specific light state
app.get('/api/lights/state/:lightId', async (req, res) => {
  try {
    const data = await forwardRequest(
      LIGHT_CONTROL_SERVICE, 
      `/api/lights/state/${req.params.lightId}`, 
      'GET'
    );
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Update light state
app.post('/api/lights/state', async (req, res) => {
  try {
    const data = await forwardRequest(LIGHT_CONTROL_SERVICE, '/api/lights/state', 'POST', req.body);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Get light command history
app.get('/api/lights/commands', async (req, res) => {
  try {
    const data = await forwardRequest(LIGHT_CONTROL_SERVICE, '/api/lights/commands', 'GET', null, req.query);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Get light statistics
app.get('/api/lights/stats', async (req, res) => {
  try {
    const data = await forwardRequest(LIGHT_CONTROL_SERVICE, '/api/lights/stats', 'GET');
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// ===========================
// Automation Service Routes
// ===========================

// Get automation rules
app.get('/api/automation/rules', async (req, res) => {
  try {
    const data = await forwardRequest(AUTOMATION_SERVICE, '/api/automation/rules', 'GET');
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Update automation rules
app.put('/api/automation/rules', async (req, res) => {
  try {
    const data = await forwardRequest(AUTOMATION_SERVICE, '/api/automation/rules', 'PUT', req.body);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Manually trigger automation
app.post('/api/automation/process', async (req, res) => {
  try {
    const data = await forwardRequest(AUTOMATION_SERVICE, '/api/automation/process', 'POST', req.body);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// ====================
// Combined Operations
// ====================

// Get complete system overview
app.get('/api/dashboard/overview', async (req, res) => {
  try {
    const [sensorStats, lightStats] = await Promise.all([
      forwardRequest(SENSOR_DATA_SERVICE, '/api/sensor-readings/stats', 'GET'),
      forwardRequest(LIGHT_CONTROL_SERVICE, '/api/lights/stats', 'GET')
    ]);

    res.json({
      success: true,
      data: {
        sensors: sensorStats.stats,
        lights: lightStats.stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`📋 Dashboard: http://localhost:${PORT}/api/dashboard/overview`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API Gateway...');
  process.exit(0);
});

