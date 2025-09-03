# Ambient Light Sensor Simulator

This Node.js script simulates a realistic ambient light sensor for the IoT Smart Home Lighting System project.

## Features

- **Realistic Light Simulation**: Time-of-day cycles, weather effects, seasonal variations
- **AWS IoT Core Integration**: MQTT over TLS with device certificates
- **Battery Simulation**: Gradual battery drain and recharge cycles
- **Error Handling**: Connection retry logic and graceful error recovery
- **Comprehensive Logging**: Detailed status information and debugging

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Download Your AWS IoT Certificates
From your AWS IoT Core console, download the following files:
- Device certificate (`.pem.crt`)
- Private key (`.pem.key`) 
- Amazon Root CA 1 (`Amazon-root-CA-1.pem`)

### 3. Update Configuration
Edit `sensor-simulator.js` and update the CONFIG object:

```javascript
const CONFIG = {
  // Your AWS IoT Core endpoint
  host: 'your-actual-endpoint.iot.us-east-1.amazonaws.com',
  
  // Update these paths to your certificate files
  certPath: './certificates/device.pem.crt',
  keyPath: './certificates/private.pem.key', 
  caPath: './certificates/Amazon-root-CA-1.pem',
  
  // Customize device settings
  deviceId: 'light_sensor_001',
  location: 'living_room',
  topic: 'iot/sensors/living_room/ambient_light/light_sensor_001/data'
};
```

### 4. Create Certificates Directory
```bash
mkdir certificates
# Copy your downloaded certificate files to this directory
```

### 5. Run the Simulator
```bash
npm start
# or
node sensor-simulator.js
```

## Expected Output

```
🚀 Starting Ambient Light Sensor Simulator
📋 Configuration:
   Device ID: light_sensor_001
   Location: living_room
   Publish Interval: 5000ms
   Topic: iot/sensors/living_room/ambient_light/light_sensor_001/data

✅ All certificate files found
🔌 Connecting to AWS IoT Core: your-endpoint.iot.us-east-1.amazonaws.com
✅ Connected to AWS IoT Core successfully!
📊 Started publishing every 5000ms
📤 Published: 425.3 lux [sunny] [Battery: 87.2%]
📤 Published: 431.7 lux [sunny] [Battery: 87.1%]
🌤️ Weather changed: sunny → partly_cloudy
📤 Published: 346.2 lux [partly_cloudy] [Battery: 87.0%]
```

## Message Format

The sensor publishes JSON messages with this structure:

```json
{
  "deviceId": "light_sensor_001",
  "deviceType": "ambient_light_sensor",
  "location": "living_room",
  "timestamp": 1678886400000,
  "ambientLight": 425,
  "unit": "lux",
  "batteryLevel": 87.2,
  "signalStrength": -42,
  "timeOfDay": "afternoon",
  "weather": "sunny",
  "readingQuality": "excellent",
  "errorCount": 0,
  "timestampISO": "2023-03-15T10:00:00.000Z"
}
```

## Troubleshooting

### Connection Issues
1. **Certificate Path Errors**: Ensure certificate files exist and paths are correct
2. **Endpoint URL**: Verify your AWS IoT Core endpoint URL
3. **Device Policy**: Check that your IoT device policy allows publishing to the topic
4. **Network**: Ensure internet connectivity and firewall allows port 8883

### Common Error Messages
- `ENOENT: no such file or directory`: Certificate file not found
- `ECONNREFUSED`: Network connectivity issue or wrong endpoint
- `UNAUTHORIZED`: Device policy doesn't allow publishing to topic

## Testing with AWS IoT Console

1. Go to AWS IoT Core → Test → MQTT test client
2. Subscribe to topic: `iot/sensors/living_room/ambient_light/light_sensor_001/data`
3. Run the simulator and verify messages appear in the console

## Next Steps

This simulator is ready for:
- Day 5: Testing data ingestion
- Day 6: Setting up DynamoDB and IoT Rules
- Week 3: Scalability testing with multiple devices

For load testing, you can run multiple instances with different device IDs and locations.
