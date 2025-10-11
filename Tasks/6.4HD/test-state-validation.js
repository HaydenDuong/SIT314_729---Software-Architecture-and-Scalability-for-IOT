const awsIot = require('aws-iot-device-sdk');

// Configuration
const host = 'a3gihr6flc6bqc-ats.iot.ap-southeast-2.amazonaws.com';
const certBasePath = './certificates';
const clientId = `state-validation-${Date.now()}`;

// Test with just 3 sensors for easy tracking
const testSensors = [
    { id: 'sensor_A', floor: 1, room: 1, lightId: 'floor1-room1-sensorA-lightA' },
    { id: 'sensor_B', floor: 1, room: 2, lightId: 'floor1-room2-sensorB-lightB' },
    { id: 'sensor_C', floor: 1, room: 3, lightId: 'floor1-room3-sensorC-lightC' }
];

// Test scenarios to force state changes
const testScenarios = [
    {
        name: "Initial State - All should turn OFF",
        data: [
            { sensorId: 'sensor_A', motion: false, light: 500 }, // OFF: No motion
            { sensorId: 'sensor_B', motion: false, light: 400 }, // OFF: No motion  
            { sensorId: 'sensor_C', motion: false, light: 300 }  // OFF: No motion
        ],
        expectedCommands: 3 // All new states
    },
    {
        name: "Motion in Low Light - Some should turn ON",
        data: [
            { sensorId: 'sensor_A', motion: true, light: 100 },  // ON: Motion + low light
            { sensorId: 'sensor_B', motion: false, light: 400 }, // OFF: No motion (no change)
            { sensorId: 'sensor_C', motion: true, light: 150 }   // ON: Motion + low light
        ],
        expectedCommands: 2 // Only A and C change state
    },
    {
        name: "Motion in Bright Light - Should turn OFF",
        data: [
            { sensorId: 'sensor_A', motion: true, light: 500 },  // OFF: Bright light (change from ON)
            { sensorId: 'sensor_B', motion: false, light: 400 }, // OFF: No motion (no change)
            { sensorId: 'sensor_C', motion: true, light: 600 }   // OFF: Bright light (change from ON)
        ],
        expectedCommands: 2 // Only A and C change state
    },
    {
        name: "No Changes - All stay OFF",
        data: [
            { sensorId: 'sensor_A', motion: false, light: 500 }, // OFF: No motion (no change)
            { sensorId: 'sensor_B', motion: false, light: 400 }, // OFF: No motion (no change)
            { sensorId: 'sensor_C', motion: false, light: 600 }  // OFF: No motion (no change)
        ],
        expectedCommands: 0 // No state changes
    }
];

// Create AWS IoT connection
const device = awsIot.device({
    keyPath: `${certBasePath}/light_sensor.private.key`,
    certPath: `${certBasePath}/light_sensor.cert.pem`,
    caPath: `${certBasePath}/root-CA.crt`,
    clientId,
    host
});

let currentScenario = 0;

console.log('🔍 STATE CHANGE VALIDATION TEST');
console.log('Testing with 3 sensors: A, B, C');
console.log('Watch Node-RED debug and DynamoDB for expected command counts\n');

device.on('connect', () => {
    console.log('✅ Connected to AWS IoT Core');
    runNextScenario();
});

function runNextScenario() {
    if (currentScenario >= testScenarios.length) {
        console.log('\n🎉 All test scenarios completed!');
        console.log('Check DynamoDB tables to validate state change detection.');
        device.end();
        process.exit(0);
        return;
    }

    const scenario = testScenarios[currentScenario];
    console.log(`\n📋 SCENARIO ${currentScenario + 1}: ${scenario.name}`);
    console.log(`Expected commands in DynamoDB: ${scenario.expectedCommands}`);
    
    // Send all sensor data for this scenario
    scenario.data.forEach((sensorTest, index) => {
        const sensor = testSensors.find(s => s.id === sensorTest.sensorId);
        const topic = `iot/sensors/floor${sensor.floor}/${sensor.room}/${sensor.id}`;
        
        const payload = {
            deviceId: sensor.id,
            floor: sensor.floor,
            room: sensor.room,
            lightId: sensor.lightId,
            motion_detected: sensorTest.motion,
            light_intensity: sensorTest.light,
            timestamp: Date.now() + index, // Slight offset to avoid exact duplicates
            scenario: scenario.name,
            test: `${sensor.id}: motion=${sensorTest.motion}, light=${sensorTest.light}`
        };

        console.log(`  📤 ${sensor.id}: motion=${sensorTest.motion}, light=${sensorTest.light}`);
        
        device.publish(topic, JSON.stringify(payload), (err) => {
            if (err) {
                console.error(`❌ Error publishing ${sensor.id}:`, err);
            }
        });
    });

    currentScenario++;
    
    // Wait 10 seconds before next scenario to let processing complete
    setTimeout(() => {
        console.log('⏳ Waiting for processing to complete...');
        setTimeout(runNextScenario, 5000);
    }, 10000);
}

device.on('error', (err) => {
    console.error('❌ AWS IoT error:', err);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted');
    device.end();
    process.exit(0);
});

console.log('🚀 Starting state change validation test...');
console.log('This will run 4 scenarios with 3 sensors each');
console.log('Watch for expected command counts in DynamoDB tables');
