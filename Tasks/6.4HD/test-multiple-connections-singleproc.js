// Single-process multi-client MQTT simulator (no child_process spawn)
// Usage examples:
//   node test-multiple-connections-singleproc.js
//   BATCH_SIZE=50 BATCH_INTERVAL_MS=500 MAX_CLIENTS=5000 PUBLISH_INTERVAL_MS=5000 node test-multiple-connections-singleproc.js

const awsIot = require('aws-iot-device-sdk');

// Configuration (overridable via env)
const host = process.env.IOT_HOST || 'a3gihr6flc6bqc-ats.iot.ap-southeast-2.amazonaws.com';
const certBasePath = process.env.CERT_BASE || './certificates';
const maxClients = parseInt(process.env.MAX_CLIENTS || '5000', 10);
const publishIntervalMs = parseInt(process.env.PUBLISH_INTERVAL_MS || '5000', 10);
const batchSize = parseInt(process.env.BATCH_SIZE || '50', 10);
const batchIntervalMs = parseInt(process.env.BATCH_INTERVAL_MS || '500', 10);
const baseOffset = parseInt(process.env.OFFSET || '0', 10);

const clients = [];
let started = 0;

function createClient(clientNumber) {
  const id = baseOffset + clientNumber;
  const sensorIdPadded = String(id).padStart(3, '0');
  const clientId = `device_${id}_${process.pid}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const device = awsIot.device({
    keyPath: `${certBasePath}/light_sensor.private.key`,
    certPath: `${certBasePath}/light_sensor.cert.pem`,
    caPath: `${certBasePath}/root-CA.crt`,
    clientId,
    host,
    // Connection tuning to reduce reconnect storms and TLS churn
    baseReconnectTimeMs: 1000,
    maximumReconnectTimeMs: 60000,
    keepalive: 30,
  });

  device.on('connect', () => {
    if (clientNumber % 100 === 0) {
      console.log(`Connected clients: ${clientNumber}/${maxClients}`);
    }

    // Periodic publish
    const interval = setInterval(() => {
      const floor = Math.floor((id - 1) / 5) + 1;
      const room = ((id - 1) % 5) + 1;
      const data = {
        deviceId: `sensor_${sensorIdPadded}`,
        floor,
        room,
        lightId: `floor${floor}-room${room}-sensor${sensorIdPadded}-light${sensorIdPadded}`,
        light_intensity: Math.round(Math.random() * 500 + 100),
        motion_detected: Math.random() < 0.3,
        timestamp: Date.now(),
        connectionTest: true,
        deviceProcess: process.pid,
      };
      const topic = `iot/sensors/floor${floor}/${room}/sensor_${sensorIdPadded}`;
      device.publish(topic, JSON.stringify(data), (err) => {
        if (err && clientNumber % 100 === 0) {
          console.error(`Publish error (client ${clientNumber}):`, err.message);
        }
      });
    }, publishIntervalMs);

    device._simInterval = interval;
  });

  device.on('error', (err) => {
    if (clientNumber % 100 === 0) {
      console.error(`Client ${clientNumber} error:`, (err && (err.code || err.message || err)));
    }
  });

  device.on('offline', () => {
    if (clientNumber % 500 === 0) {
      console.warn(`Client ${clientNumber} offline`);
    }
  });

  device.on('reconnect', () => {
    if (clientNumber % 500 === 0) {
      console.warn(`Client ${clientNumber} reconnecting`);
    }
  });

  device.on('close', () => {
    if (clientNumber % 500 === 0) {
      console.warn(`Client ${clientNumber} connection closed`);
    }
  });

  clients.push(device);
}

function startClientsGradually() {
  console.log('🔌 MULTIPLE MQTT CONNECTIONS TEST (single-process)');
  console.log(`📋 Plan: start ${maxClients} clients (batch=${batchSize}, interval=${batchIntervalMs}ms, offset=${baseOffset})`);
  console.log('📊 Monitor EC2 CPU/Memory, MQTT connection count, Node-RED performance\n');

  const timer = setInterval(() => {
    if (started >= maxClients) {
      clearInterval(timer);
      console.log(`\n✅ All ${maxClients} clients started`);
      console.log('📊 Let it run 5-10 minutes, then Ctrl+C to stop');
      return;
    }

    for (let i = 0; i < batchSize && started < maxClients; i++) {
      started += 1;
      createClient(started);
    }

    if (started % (batchSize * 10) === 0) {
      console.log(`📈 Progress: ${started}/${maxClients}`);
    }
  }, batchIntervalMs);
}

function shutdown() {
  console.log('\n🛑 Shutting down all MQTT clients...');
  clients.forEach((device, idx) => {
    if (device._simInterval) clearInterval(device._simInterval);
    try { device.end(); } catch (e) {}
    if ((idx + 1) % 500 === 0) {
      console.log(`Closed ${idx + 1} clients...`);
    }
  });
  setTimeout(() => {
    console.log('✅ All clients closed');
    process.exit(0);
  }, 3000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('🚀 Multiple connections (single-process) starting...');
setTimeout(startClientsGradually, 500);