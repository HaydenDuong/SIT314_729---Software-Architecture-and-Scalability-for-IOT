const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const LightState = require('./models/LightState');
const LightCommand = require('./models/LightCommand');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iot_smart_lighting';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Light Control Service: MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// REST API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'light-control-service',
    mongodb: mongoose.connection.readyState === 1
  });
});

// POST: Update light state (with state change detection)
app.post('/api/lights/state', async (req, res) => {
  try {
    const { lightId, deviceId, floor, room, desiredState, reason, lastMotionDetected, lastLightIntensity } = req.body;

    if (!lightId || !desiredState) {
      return res.status(400).json({ 
        success: false, 
        error: 'lightId and desiredState are required' 
      });
    }

    // Check current state
    const currentState = await LightState.findOne({ lightId });
    
    let stateChanged = false;
    if (!currentState || currentState.desiredState !== desiredState) {
      stateChanged = true;
      
      // Update or create state
      const updatedState = await LightState.findOneAndUpdate(
        { lightId },
        {
          lightId,
          deviceId,
          floor,
          room,
          desiredState,
          reason,
          lastMotionDetected,
          lastLightIntensity,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      // Record command only if state changed
      const command = new LightCommand({
        lightId,
        deviceId,
        command: desiredState,
        floor,
        room,
        previousState: currentState ? currentState.desiredState : 'UNKNOWN',
        newState: desiredState,
        reason,
        executedAt: new Date(),
        status: 'executed'
      });
      await command.save();

      console.log(`💡 State changed for ${lightId}: ${currentState?.desiredState || 'UNKNOWN'} → ${desiredState}`);

      return res.json({ 
        success: true, 
        stateChanged: true,
        message: 'Light state updated and command recorded',
        data: { state: updatedState, command }
      });
    } else {
      // State unchanged - no command needed
      console.log(`⚪ No state change for ${lightId}: already ${desiredState}`);
      
      return res.json({ 
        success: true, 
        stateChanged: false,
        message: 'No state change needed',
        data: { state: currentState }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Get current light state
app.get('/api/lights/state/:lightId', async (req, res) => {
  try {
    const { lightId } = req.params;
    
    const state = await LightState.findOne({ lightId });
    
    if (!state) {
      return res.status(404).json({ 
        success: false, 
        error: 'Light state not found' 
      });
    }

    res.json({ success: true, data: state });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Get all light states
app.get('/api/lights/states', async (req, res) => {
  try {
    const { floor, room } = req.query;
    
    const query = {};
    if (floor) query.floor = parseInt(floor);
    if (room) query.room = parseInt(room);

    const states = await LightState.find(query).sort({ lastUpdated: -1 });

    res.json({ 
      success: true, 
      count: states.length,
      data: states 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Get light command history
app.get('/api/lights/commands', async (req, res) => {
  try {
    const { lightId, deviceId, limit = 100 } = req.query;
    
    const query = {};
    if (lightId) query.lightId = lightId;
    if (deviceId) query.deviceId = deviceId;

    const commands = await LightCommand.find(query)
      .sort({ executedAt: -1 })
      .limit(parseInt(limit));

    res.json({ 
      success: true, 
      count: commands.length,
      data: commands 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Statistics
app.get('/api/lights/stats', async (req, res) => {
  try {
    const totalStates = await LightState.countDocuments();
    const totalCommands = await LightCommand.countDocuments();
    const lightsOn = await LightState.countDocuments({ desiredState: 'ON' });
    const lightsOff = await LightState.countDocuments({ desiredState: 'OFF' });

    res.json({
      success: true,
      stats: {
        totalLights: totalStates,
        lightsOn,
        lightsOff,
        totalCommands,
        commandsToday: await LightCommand.countDocuments({
          executedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        })
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Clear all states and commands (for testing)
app.delete('/api/lights/clear', async (req, res) => {
  try {
    const statesDeleted = await LightState.deleteMany({});
    const commandsDeleted = await LightCommand.deleteMany({});
    
    res.json({ 
      success: true, 
      message: `Deleted ${statesDeleted.deletedCount} states and ${commandsDeleted.deletedCount} commands` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Light Control Service running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Light Control Service...');
  await mongoose.connection.close();
  process.exit(0);
});

