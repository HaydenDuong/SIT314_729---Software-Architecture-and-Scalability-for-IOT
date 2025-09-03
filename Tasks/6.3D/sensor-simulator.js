/**
 * Simulated Ambient Light Sensor for IoT Smart Home Lighting System
 * 
 * This script simulates a realistic ambient light sensor that publishes
 * light intensity readings to AWS IoT Core via MQTT protocol.
 * 
 * Features:
 * - Realistic light patterns with time-of-day cycles
 * - Weather simulation (sunny/cloudy/rainy)
 * - Seasonal variations
 * - Random noise and fluctuations
 * - Battery level simulation
 * - Connection error handling and retry logic
 */

const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// Configuration - Update these paths with your actual certificate files
const CONFIG = {
  // AWS IoT Core endpoint (replace with your endpoint)
  host: 'a3gihr6flc6bqc-ats.iot.ap-southeast-2.amazonaws.com',
  port: 8883,
  protocol: 'mqtts',
  
  // Certificate paths (update these with your actual file paths)
  certPath: './certificates/light_sensor.cert.pem',
  keyPath: './certificates/light_sensor.private.key',
  caPath: './certificates/root-CA.crt',
  
  // Device configuration
  deviceId: 'light_sensor_001',
  location: 'living_room',
  
  // Publishing configuration
  publishInterval: 5000, // 5 seconds
  topic: 'test/topic', // Simplified topic for testing
  
  // Simulation parameters
  simulation: {
    enableTimeOfDay: true,
    enableWeather: true,
    enableSeasonal: true,
    enableNoise: true,
    batteryDrainRate: 0.001 // Very slow battery drain for simulation
  }
};

class AmbientLightSensor {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.isConnected = false;
    this.publishTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3; // Reduced for faster testing
    
    // Sensor state
    this.batteryLevel = 85 + Math.random() * 15; // Start with 85-100%
    this.lastReading = 0;
    this.errorCount = 0;
    
    // Weather state (changes periodically)
    this.currentWeather = this.getRandomWeather();
    this.weatherChangeTimer = null;
    
    console.log(`🌟 Initializing Ambient Light Sensor: ${config.deviceId}`);
    console.log(`📍 Location: ${config.location}`);
    console.log(`📡 Publishing to: ${config.topic}`);
  }

  /**
   * Initialize MQTT connection to AWS IoT Core
   */
  async connect() {
    try {
      // Check if certificate files exist
      this.validateCertificates();
      
      const options = {
        host: this.config.host,
        port: this.config.port,
        protocol: this.config.protocol,
        cert: fs.readFileSync(this.config.certPath),
        key: fs.readFileSync(this.config.keyPath),
        ca: fs.readFileSync(this.config.caPath),
        clientId: this.config.deviceId,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
        keepalive: 60
      };

      console.log(`🔌 Connecting to AWS IoT Core: ${this.config.host}`);
      this.client = mqtt.connect(options);

      this.client.on('connect', () => {
        console.log('✅ Connected to AWS IoT Core successfully!');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startPublishing();
        this.startWeatherChanges();
      });

      this.client.on('error', (error) => {
        console.error('❌ MQTT Connection Error:', error.message);
        console.error('❌ Full error details:', error);
        this.isConnected = false;
        this.errorCount++;
      });

      this.client.on('offline', () => {
        console.log('📴 Device went offline');
        this.isConnected = false;
        this.stopPublishing();
      });

      this.client.on('reconnect', () => {
        this.reconnectAttempts++;
        console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached. Stopping...');
          this.client.end();
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize connection:', error.message);
      throw error;
    }
  }

  /**
   * Validate that certificate files exist
   */
  validateCertificates() {
    const files = [
      { path: this.config.certPath, name: 'Device Certificate' },
      { path: this.config.keyPath, name: 'Private Key' },
      { path: this.config.caPath, name: 'Root CA' }
    ];

    files.forEach(file => {
      if (!fs.existsSync(file.path)) {
        throw new Error(`${file.name} not found at: ${file.path}`);
      }
    });

    console.log('✅ All certificate files found');
  }

  /**
   * Start publishing sensor data at regular intervals
   */
  startPublishing() {
    if (this.publishTimer) {
      clearInterval(this.publishTimer);
    }

    this.publishTimer = setInterval(() => {
      if (this.isConnected) {
        this.publishSensorReading();
      }
    }, this.config.publishInterval);

    console.log(`📊 Started publishing every ${this.config.publishInterval}ms`);
  }

  /**
   * Stop publishing sensor data
   */
  stopPublishing() {
    if (this.publishTimer) {
      clearInterval(this.publishTimer);
      this.publishTimer = null;
    }
  }

  /**
   * Publish a single sensor reading
   */
  async publishSensorReading() {
    try {
      const reading = this.generateRealisticLightReading();
      const message = this.createSensorMessage(reading);
      
      this.client.publish(this.config.topic, JSON.stringify(message), (error) => {
        if (error) {
          console.error('❌ Publish error:', error.message);
          this.errorCount++;
        } else {
          console.log(`📤 Published: ${reading.toFixed(1)} lux [${this.currentWeather}] [Battery: ${this.batteryLevel.toFixed(1)}%]`);
          this.lastReading = reading;
          this.updateBatteryLevel();
        }
      });

    } catch (error) {
      console.error('❌ Error generating sensor reading:', error.message);
      this.errorCount++;
    }
  }

  /**
   * Generate realistic ambient light reading based on time, weather, and season
   */
  generateRealisticLightReading() {
    let lightLevel = 100; // Base indoor light level

    // Time-of-day simulation
    if (this.config.simulation.enableTimeOfDay) {
      lightLevel = this.getTimeOfDayLight();
    }

    // Weather effects
    if (this.config.simulation.enableWeather) {
      lightLevel *= this.getWeatherFactor();
    }

    // Seasonal effects
    if (this.config.simulation.enableSeasonal) {
      lightLevel *= this.getSeasonalFactor();
    }

    // Add realistic noise and fluctuations
    if (this.config.simulation.enableNoise) {
      const noise = 0.9 + Math.random() * 0.2; // ±10% variation
      lightLevel *= noise;
    }

    // Ensure realistic bounds (0-1000 lux for indoor lighting)
    return Math.max(0, Math.min(1000, Math.round(lightLevel)));
  }

  /**
   * Calculate light levels based on time of day
   */
  getTimeOfDayLight() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInHours = hour + minute / 60;

    // Simulate natural light patterns
    if (timeInHours >= 6 && timeInHours < 8) {
      // Dawn: gradual increase
      return 150 + (timeInHours - 6) * 175; // 150-500 lux
    } else if (timeInHours >= 8 && timeInHours < 17) {
      // Daytime: peak light with sun angle simulation
      const midDay = 12.5;
      const sunAngle = Math.cos((timeInHours - midDay) * Math.PI / 8);
      return 400 + sunAngle * 400; // 400-800 lux
    } else if (timeInHours >= 17 && timeInHours < 19) {
      // Dusk: gradual decrease
      return 500 - (timeInHours - 17) * 225; // 500-50 lux
    } else {
      // Night: very low ambient light
      return 20 + Math.random() * 30; // 20-50 lux
    }
  }

  /**
   * Get weather factor affecting light levels
   */
  getWeatherFactor() {
    const factors = {
      'sunny': 1.0,
      'partly_cloudy': 0.8,
      'cloudy': 0.6,
      'overcast': 0.4,
      'rainy': 0.3
    };
    return factors[this.currentWeather] || 0.7;
  }

  /**
   * Get seasonal factor affecting light levels
   */
  getSeasonalFactor() {
    const month = new Date().getMonth(); // 0-11
    // Summer (Jun-Aug) = 1.0, Winter (Dec-Feb) = 0.7
    const seasonalCurve = 0.7 + 0.3 * Math.sin((month - 2) * Math.PI / 6);
    return Math.max(0.6, Math.min(1.0, seasonalCurve));
  }

  /**
   * Get random weather condition
   */
  getRandomWeather() {
    const conditions = ['sunny', 'partly_cloudy', 'cloudy', 'overcast', 'rainy'];
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // Probability weights
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < conditions.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return conditions[i];
      }
    }
    return 'cloudy'; // Default fallback
  }

  /**
   * Start periodic weather changes
   */
  startWeatherChanges() {
    // Change weather every 10-30 minutes for simulation
    const changeInterval = (10 + Math.random() * 20) * 60 * 1000;
    
    this.weatherChangeTimer = setInterval(() => {
      const oldWeather = this.currentWeather;
      this.currentWeather = this.getRandomWeather();
      
      if (oldWeather !== this.currentWeather) {
        console.log(`🌤️ Weather changed: ${oldWeather} → ${this.currentWeather}`);
      }
    }, changeInterval);
  }

  /**
   * Create sensor message payload
   */
  createSensorMessage(lightReading) {
    const now = new Date();
    
    return {
      deviceId: this.config.deviceId,
      deviceType: 'ambient_light_sensor',
      location: this.config.location,
      timestamp: now.getTime(),
      
      // Primary sensor data
      ambientLight: lightReading,
      unit: 'lux',
      
      // Device status
      batteryLevel: Math.round(this.batteryLevel * 10) / 10,
      signalStrength: -45 + Math.random() * 20, // Simulate WiFi signal
      
      // Metadata for analysis
      timeOfDay: this.getTimeOfDayCategory(),
      weather: this.currentWeather,
      
      // Quality indicators
      readingQuality: this.getReadingQuality(),
      errorCount: this.errorCount,
      
      // ISO timestamp for human readability
      timestampISO: now.toISOString()
    };
  }

  /**
   * Get time of day category
   */
  getTimeOfDayCategory() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Determine reading quality based on various factors
   */
  getReadingQuality() {
    if (this.batteryLevel < 20) return 'low';
    if (this.errorCount > 5) return 'degraded';
    if (this.batteryLevel > 80 && this.errorCount === 0) return 'excellent';
    return 'good';
  }

  /**
   * Simulate battery drain
   */
  updateBatteryLevel() {
    this.batteryLevel -= this.config.simulation.batteryDrainRate;
    
    // Simulate battery recharge (could represent device plugged in)
    if (this.batteryLevel < 15 && Math.random() < 0.1) {
      this.batteryLevel = 85 + Math.random() * 15;
      console.log('🔋 Battery recharged!');
    }
    
    // Warning for low battery
    if (this.batteryLevel < 20 && this.batteryLevel > 19) {
      console.log('⚠️ Low battery warning!');
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Shutting down sensor...');
    
    this.stopPublishing();
    
    if (this.weatherChangeTimer) {
      clearInterval(this.weatherChangeTimer);
    }
    
    if (this.client && this.isConnected) {
      this.client.end();
    }
    
    console.log('✅ Sensor shutdown complete');
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Ambient Light Sensor Simulator');
  console.log('📋 Configuration:');
  console.log(`   Device ID: ${CONFIG.deviceId}`);
  console.log(`   Location: ${CONFIG.location}`);
  console.log(`   Publish Interval: ${CONFIG.publishInterval}ms`);
  console.log(`   Topic: ${CONFIG.topic}`);
  console.log('');

  const sensor = new AmbientLightSensor(CONFIG);

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await sensor.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await sensor.shutdown();
    process.exit(0);
  });

  try {
    await sensor.connect();
  } catch (error) {
    console.error('❌ Failed to start sensor:', error.message);
    console.log('\n📝 Please check:');
    console.log('   1. AWS IoT endpoint URL is correct');
    console.log('   2. Certificate files exist and paths are correct');
    console.log('   3. Device policy allows publishing to the topic');
    console.log('   4. Network connectivity to AWS IoT Core');
    process.exit(1);
  }
}

// Export for testing
module.exports = { AmbientLightSensor, CONFIG };

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
