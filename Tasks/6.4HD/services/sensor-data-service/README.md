# Sensor Data Service

Microservice responsible for receiving and storing IoT sensor data.

## Features
- Subscribes to AWS IoT Core MQTT topics
- Stores sensor readings in MongoDB
- Exposes REST API for querying sensor data
- Real-time data ingestion

## Environment Variables
Create a `.env` file with:
```
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iot_smart_lighting
IOT_HOST=a3gihr6flc6bqc-ats.iot.ap-southeast-2.amazonaws.com
CERT_PATH=../../certificates/light_sensor.cert.pem
KEY_PATH=../../certificates/light_sensor.private.key
CA_PATH=../../certificates/root-CA.crt
```

## API Endpoints
- `GET /health` - Health check
- `POST /api/sensor-readings` - Create sensor reading
- `GET /api/sensor-readings` - Query sensor readings
- `GET /api/sensor-readings/latest/:deviceId` - Get latest reading
- `GET /api/sensor-readings/stats` - Get statistics
- `DELETE /api/sensor-readings` - Clear all readings (testing)

## Run
```bash
npm install
npm start
```

