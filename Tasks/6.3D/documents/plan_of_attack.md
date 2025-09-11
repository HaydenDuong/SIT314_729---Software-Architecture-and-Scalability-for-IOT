# 4-Week Project Plan: Scalable Smart Home Lighting System

This plan outlines the daily tasks for completing the project within a four-week timeline. It is structured for a 7-day work week to provide a clear schedule, with weekend tasks focused on review and preparation.

**Note:** This project uses **software simulators** instead of physical hardware, which is the accepted standard for this unit. All "sensors" and "actuators" will be implemented as PC-based simulation scripts that communicate with the cloud infrastructure.

---

## **Week 1: Foundation, Architecture, and Basic Data Flow**
**Goal:** Establish the project foundation, design the architecture, and create a simple, end-to-end data flow from a simulated sensor to the AWS cloud.

*   **Day 1: Project Kickoff & Planning**
    *   [X] Thoroughly review the project proposal and requirements document (`distinction_plan.pdf`).
    *   [X] Set up a Git repository (e.g., on GitHub) for version control.
    *   [X] Create an initial `README.md` file with a project overview and objectives.
    *   [X] Initialize a local Node.js project (`npm init -y`).

*   **Day 2: AWS Environment Setup**
    *   [X] Configure your AWS account.
    *   [X] Create an IAM (Identity and Access Management) user with specific permissions for your project to follow security best practices. Avoid using the root user. (User name: tester / Custom password: Qelol669@)
    *   [X] Set up the AWS Command Line Interface (CLI) on your local machine with your new IAM user credentials.
    *   [ ] Briefly research the core AWS services you'll be using: IoT Core, Lambda, DynamoDB, API Gateway, and CloudWatch.

*   **Day 3: System Architecture & Data Design**
    *   [X] Refine the high-level block diagram of the system as outlined in your proposal.
    *   [X] Finalize the data schema for your DynamoDB tables (`SensorData`, `LightStates`, `UserRules`). Define partition keys and sort keys for efficient querying.
    *   [X] Define the MQTT topic structure you will use (e.g., `iot/sensors/livingroom/light` or `iot/commands/livingroom/light1`).

*   **Day 4: AWS IoT Core & Device Simulation**
    *   [X] In the AWS IoT Core console, create a "Thing" to represent your first simulated sensor.
    *   [X] Generate, download, and securely save the device certificates (public key, private key, root CA) and policies.
    *   [X] Write a simple Python or Node.js script to act as your simulated ambient light sensor. This script will use the MQTT protocol and the downloaded certificates to connect and publish data to AWS IoT Core.

*   **Day 5: First Data Ingestion**
    *   [X] Run your sensor script to publish simulated data (e.g., `{ "light_intensity": 450, "timestamp": 1678886400 }`) to your chosen MQTT topic.
    *   [X] Use the MQTT test client in the AWS IoT Core console to subscribe to that topic and verify that messages are being received correctly.
    *   [X] Troubleshoot any connection, authentication, or data format issues.

*   **Day 6: Database Setup & Basic Rule**
    *   [X] In the AWS console, create the `SensorData` DynamoDB table using the schema designed on Day 3.
    *   [X] Create a simple AWS IoT Rule that triggers on a message publication and sends the raw message data directly to a CloudWatch Log group for basic logging and verification.

*   **Day 7: Weekly Review & Lookahead**
    *   [X] Review the week's progress against the plan and commit all code to your Git repository.
    *   [X] Consolidate all your notes and diagrams into a project folder.
    *   [X] Read the "Getting Started" guides for AWS Lambda and API Gateway to prepare for Week 2.

---

## **Week 2: Core Logic, Automation, and Full Simulation Loop**
**Goal:** Process the incoming data, implement automation logic using Node-RED, and create a complete, simulated loop from sensor input to actuator output.

*   **Day 8: Data Processing with Lambda**
    *   [X] Create a Node.js-based AWS Lambda function named `SensorDataProcessor`.
    *   [X] Grant the Lambda function's execution role the necessary permissions to write to your `SensorData` DynamoDB table.
    *   [X] Modify the AWS IoT Rule from Day 6 to trigger this Lambda function instead.
    *   [X] Write code in the Lambda function to parse the incoming sensor data and correctly format it before writing it to the `SensorData` table.

*   **Day 9: Actuator Simulation with API Gateway & Lambda**
    *   [X] Create a second Node.js Lambda function called `SimulatedLightActuator`. This function's job is to simply log a message like "Light [lightId] turned [ON/OFF]" to CloudWatch Logs.
    *   [X] Create an HTTP API Gateway endpoint that triggers this Lambda function. This will be your "dummy API" for controlling the light.
    *   [X] Test the API endpoint using a tool like Postman or `curl` to ensure it triggers the Lambda correctly.

*   **Day 10: Node-RED Setup**
    *   [X] Install and run a local instance of Node-RED.
    *   [X] Install the necessary nodes: `node-red-contrib-aws-iot-hub` (or a similar MQTT node) and `node-red-dashboard`.
    *   [X] Configure an `mqtt in` node in Node-RED to connect to your AWS IoT Core instance and subscribe to the sensor data topics.

*   **Day 11: Basic Automation Flow in Node-RED**
    *   [X] Create a simple Node-RED flow:
        1.  An `mqtt in` node to receive sensor data from AWS IoT.
        2.  A `switch` node to implement a rule (e.g., "if `payload.light_intensity` < 300").
        3.  An `http request` node that calls your simulated actuator API Gateway endpoint to "turn the light on".

*   **Day 12: Enhancing the Automation Flow & UI**
    *   [X] Add a second output to the `switch` node to handle the "turn light off" condition (e.g., if `payload.light_intensity` >= 300).
    *   [X] Implement a simple UI using `node-red-dashboard` nodes (`gauge`, `text`, `ui_switch`) to visualize the current sensor value and the simulated light state.

*   **Day 13: Error Handling & State Management**
    *   [X] Improve your Node-RED flow and Lambda functions with comprehensive error handling (e.g., using `try...catch` blocks and `catch` nodes).
    *   [X] Implement retry logic and fallback mechanisms in Lambda functions.
    *   [X] Create CloudWatch error logging for all components.
    *   [X] Add "catch" nodes in Node-RED to handle MQTT connection failures.
    *   [X] Create the `LightStates` DynamoDB table.
    *   [X] Modify your `SimulatedLightActuator` Lambda to write the new state ("ON" or "OFF") to the `LightStates` table.
    *   [X] Add graceful error responses with retry flags for failed operations.

*   **Day 14: Weekly Review & Full Loop Test**
    *   [X] Test the entire simulated loop end-to-end: Sensor script -> AWS IoT -> Lambda -> DynamoDB -> Node-RED -> API Gateway -> Actuator Lambda -> DynamoDB.
    *   [X] Document the completed flow with screenshots and commit all work.
    *   [X] Brainstorm the script needed for the scalability test: how to manage multiple device certificates and run concurrent connections.

---

## **Week 3: Scalability Testing, Security, and Deployment**
**Goal:** Deploy the solution to a more robust environment, conduct and document scalability experiments, and implement security and monitoring best practices.

*   **Day 15: Security Hardening**
    *   [ ] Review all IAM roles and policies. Ensure they follow the principle of least privilege (i.e., grant only the permissions necessary for each function).
    *   [ ] Review the AWS IoT device policy to ensure it restricts devices to publish/subscribe only to their designated topics.
    *   [ ] Add a layer of protection to your API Gateway endpoint, such as requiring an API key.

*   **Day 16: Monitoring & CloudWatch Dashboards**
    *   [ ] In AWS CloudWatch, create a custom dashboard for your project.
    *   [ ] Add widgets to monitor key metrics: Number of IoT messages, Lambda invocations, Lambda error rates and duration, and DynamoDB read/write capacity units.

*   **Day 17: Planning the Scalability Test**
    *   [ ] Formally define the test parameters: How many virtual devices will you simulate? What will the message frequency be? How long will the test run?
    *   [ ] Write a clear plan for what metrics to capture from your CloudWatch dashboard and how you will present them as evidence of scalability.
    *   [ ] Design the data flow strategy for bidirectional sensor-actuator communication.
    *   [ ] Plan realistic sensor simulation algorithms (time-of-day cycles, random variations, multiple sensor types).
    *   [ ] Define test scenarios: 100 devices (5-second intervals), 500 devices (10-second intervals), 1000+ devices (peak load).

*   **Day 18: Developing the Load-Testing Script**
    *   [ ] Create a new, more advanced Node.js or Python script designed for load testing.
    *   [ ] Implement certificate management strategy for testing (single permissive certificate with unique client IDs).
    *   [ ] Create device ID generation system (`test_device_001`, `test_device_002`, etc.).
    *   [ ] Implement connection pooling for multiple simulated devices.
    *   [ ] The script should publish messages on unique topics for each simulated device.
    *   [ ] Add realistic sensor data simulation with time-of-day factors and random variations.
    *   [ ] Include multiple sensor types (ambient light, PIR motion, door/window sensors).

*   **Day 19: Executing Scalability Test v1**
    *   [ ] Run the load-test script with a moderate load (e.g., 100 devices sending a message every 5 seconds for 10 minutes).
    *   [ ] While the test is running, actively monitor your CloudWatch dashboard.
    *   [ ] Add error monitoring during scalability tests (connection failures, retry rates).
    *   [ ] Monitor Node-RED performance metrics (CPU usage, memory consumption, message processing rate).
    *   [ ] Track Lambda performance (invocation count, duration, error rate, throttling).
    *   [ ] Capture screenshots of the dashboard graphs. Note any errors, throttled requests, or performance degradation.

*   **Day 20: Analyzing Results & Optimization**
    *   [ ] Analyze the results from yesterday's test. Did any part of the system fail or slow down? Was there Lambda throttling? Did DynamoDB handle the writes?
    *   [ ] Based on the data, optimize the system. This might involve increasing Lambda concurrency limits or changing the DynamoDB capacity mode from Provisioned to On-Demand.

*   **Day 21: Weekly Review & Re-test**
    *   [ ] Run a second, larger scalability test (e.g., 500-1000 devices) on the optimized system.
    *   [ ] Document the improved results, demonstrating how your changes enhanced scalability. Capture new screenshots.
    *   [ ] Organize all your test evidence (screenshots, logs, metrics) in a dedicated folder. Commit your load-testing script.

---

## **Week 4: Finalization, Documentation, and Submission**
**Goal:** Finalize the project code, write the comprehensive final report, and prepare all materials for submission.

*   **Day 22: Code Refinement and Cleanup**
    *   [ ] Review all your code (sensor scripts, Lambda functions, test scripts).
    *   [ ] Add comments where necessary to explain complex logic.
    *   [ ] Ensure your code is clean, well-organized, and follows consistent naming conventions.

*   **Day 23: Finalizing the GitHub Repository**
    *   [ ] Update the `README.md` to be a complete user guide. It should include:
        *   A project description and the final architecture diagram.
        *   Step-by-step instructions on how to set up and deploy the system.
        *   Instructions on how to run the simulation and scalability tests.
    *   [ ] Ensure all code, including your Node-RED flow (exported as a JSON file), is commented, committed, and pushed to the repository.

*   **Day 24: Writing the Project Report (Sections 1-2)**
    *   [ ] Begin writing the final report document.
    *   [ ] **Section 1: High-Level Problem Analysis.** Describe the problem, stakeholders, and requirements, referencing your proposal.
    *   [ ] **Section 2: Solution Design.** Detail your final architecture with the block diagram, data models, and a justification for your technology choices.

*   **Day 25: Writing the Project Report (Sections 3-4)**
    *   [ ] **Section 3: Deployment and Scalability Evidence.** This is the most critical part. Embed the graphs and metrics from your scalability tests. Explain what the graphs show and how the results prove your system is scalable.
    *   [ ] **Section 4: Discussion & Conclusion.** Discuss the appropriateness of your solution, its limitations, potential security vulnerabilities, and ideas for future improvements.

*   **Day 26: Compiling Evidence & Peer Review**
    *   [ ] Gather all required files: the final report (exported as a PDF), the link to your GitHub repository, and any other specified evidence.
    *   [ ] If possible, have a friend or your tutor quickly review your report and GitHub repo for clarity, typos, and completeness.

*   **Day 27: Final Review & Submission Prep**
    *   [ ] Do a final check of all submission requirements from the project brief.
    *   [ ] Create a submission checklist and tick off every single item to ensure nothing is missed.
    *   [ ] Package all files into a single zip archive if required by the submission portal.

*   **Day 28: Submit!**
    *   [ ] Submit your completed project.
    *   [ ] Well done! Take a moment to relax.

---

## **Simulator Implementation Guidelines**

### **Sensor Simulator Best Practices**
*   **Realistic Data Generation**: Implement time-of-day cycles, seasonal variations, and random noise
*   **Multiple Sensor Types**: 
    ```javascript
    // Ambient Light: 0-1000 lux with day/night cycle
    // PIR Motion: boolean with realistic human movement patterns
    // Door/Window: boolean with realistic usage frequency
    ```
*   **Error Simulation**: Include occasional sensor failures, network disconnections, and data corruption

### **Certificate Management for Testing**
*   **Single Certificate Strategy**: Use one permissive test certificate with unique client IDs
*   **Device ID Format**: `test_device_001`, `test_device_002`, etc.
*   **Topic Structure**: `iot/sensors/{location}/{sensorType}/{deviceId}`

### **Load Testing Script Structure**
```javascript
const simulateDevices = (deviceCount, messageInterval) => {
  for (let i = 0; i < deviceCount; i++) {
    const deviceId = `sensor_${String(i).padStart(3, '0')}`;
    
    setInterval(() => {
      const sensorData = {
        deviceId: deviceId,
        light_intensity: simulateAmbientLight(),
        timestamp: Date.now(),
        location: `room_${Math.floor(i/10)}`
      };
      
      publishToMQTT(sensorData);
    }, messageInterval);
  }
};
```

### **Error Handling Implementation**
```javascript
// Lambda Error Handling
exports.handler = async (event) => {
  try {
    const result = await processSensorData(event);
    return { statusCode: 200, body: result };
  } catch (error) {
    console.error('Error processing sensor data:', error);
    await logError(error);
    return { 
      statusCode: 500, 
      body: { error: 'Processing failed', retry: true }
    };
  }
};
```

### **Actuator Simulator**
```javascript
// Simulate realistic light control with delays
const simulateLightControl = async (lightId, action) => {
  console.log(`Light ${lightId} turning ${action}...`);
  
  // Simulate physical delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`Light ${lightId} is now ${action}`);
  return { success: true, lightId, state: action };
};
```
