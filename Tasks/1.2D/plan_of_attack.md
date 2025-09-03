# 4-Week Project Plan: Scalable Smart Home Lighting System

This plan outlines the daily tasks for completing the project within a four-week timeline. It is structured for a 7-day work week to provide a clear schedule, with weekend tasks focused on review and preparation.

---

## **Week 1: Foundation, Architecture, and Basic Data Flow**
**Goal:** Establish the project foundation, design the architecture, and create a simple, end-to-end data flow from a simulated sensor to the AWS cloud.

*   **Day 1: Project Kickoff & Planning**
    *   [ ] Thoroughly review the project proposal and requirements document (`distinction_plan.pdf`).
    *   [ ] Set up a Git repository (e.g., on GitHub) for version control.
    *   [ ] Create an initial `README.md` file with a project overview and objectives.
    *   [ ] Initialize a local Node.js project (`npm init -y`).

*   **Day 2: AWS Environment Setup**
    *   [ ] Configure your AWS account.
    *   [ ] Create an IAM (Identity and Access Management) user with specific permissions for your project to follow security best practices. Avoid using the root user.
    *   [ ] Set up the AWS Command Line Interface (CLI) on your local machine with your new IAM user credentials.
    *   [ ] Briefly research the core AWS services you'll be using: IoT Core, Lambda, DynamoDB, API Gateway, and CloudWatch.

*   **Day 3: System Architecture & Data Design**
    *   [ ] Refine the high-level block diagram of the system as outlined in your proposal.
    *   [ ] Finalize the data schema for your DynamoDB tables (`SensorData`, `LightStates`, `UserRules`). Define partition keys and sort keys for efficient querying.
    *   [ ] Define the MQTT topic structure you will use (e.g., `iot/sensors/livingroom/light` or `iot/commands/livingroom/light1`).

*   **Day 4: AWS IoT Core & Device Simulation**
    *   [ ] In the AWS IoT Core console, create a "Thing" to represent your first simulated sensor.
    *   [ ] Generate, download, and securely save the device certificates (public key, private key, root CA) and policies.
    *   [ ] Write a simple Python or Node.js script to act as your simulated ambient light sensor. This script will use the MQTT protocol and the downloaded certificates to connect and publish data to AWS IoT Core.

*   **Day 5: First Data Ingestion**
    *   [ ] Run your sensor script to publish simulated data (e.g., `{ "light_intensity": 450, "timestamp": 1678886400 }`) to your chosen MQTT topic.
    *   [ ] Use the MQTT test client in the AWS IoT Core console to subscribe to that topic and verify that messages are being received correctly.
    *   [ ] Troubleshoot any connection, authentication, or data format issues.

*   **Day 6: Database Setup & Basic Rule**
    *   [ ] In the AWS console, create the `SensorData` DynamoDB table using the schema designed on Day 3.
    *   [ ] Create a simple AWS IoT Rule that triggers on a message publication and sends the raw message data directly to a CloudWatch Log group for basic logging and verification.

*   **Day 7: Weekly Review & Lookahead**
    *   [ ] Review the week's progress against the plan and commit all code to your Git repository.
    *   [ ] Consolidate all your notes and diagrams into a project folder.
    *   [ ] Read the "Getting Started" guides for AWS Lambda and API Gateway to prepare for Week 2.

---

## **Week 2: Core Logic, Automation, and Full Simulation Loop**
**Goal:** Process the incoming data, implement automation logic using Node-RED, and create a complete, simulated loop from sensor input to actuator output.

*   **Day 8: Data Processing with Lambda**
    *   [ ] Create a Node.js-based AWS Lambda function named `SensorDataProcessor`.
    *   [ ] Grant the Lambda function's execution role the necessary permissions to write to your `SensorData` DynamoDB table.
    *   [ ] Modify the AWS IoT Rule from Day 6 to trigger this Lambda function instead.
    *   [ ] Write code in the Lambda function to parse the incoming sensor data and correctly format it before writing it to the `SensorData` table.

*   **Day 9: Actuator Simulation with API Gateway & Lambda**
    *   [ ] Create a second Node.js Lambda function called `SimulatedLightActuator`. This function's job is to simply log a message like "Light [lightId] turned [ON/OFF]" to CloudWatch Logs.
    *   [ ] Create an HTTP API Gateway endpoint that triggers this Lambda function. This will be your "dummy API" for controlling the light.
    *   [ ] Test the API endpoint using a tool like Postman or `curl` to ensure it triggers the Lambda correctly.

*   **Day 10: Node-RED Setup**
    *   [ ] Install and run a local instance of Node-RED.
    *   [ ] Install the necessary nodes: `node-red-contrib-aws-iot-hub` (or a similar MQTT node) and `node-red-dashboard`.
    *   [ ] Configure an `mqtt in` node in Node-RED to connect to your AWS IoT Core instance and subscribe to the sensor data topics.

*   **Day 11: Basic Automation Flow in Node-RED**
    *   [ ] Create a simple Node-RED flow:
        1.  An `mqtt in` node to receive sensor data from AWS IoT.
        2.  A `switch` node to implement a rule (e.g., "if `payload.light_intensity` < 300").
        3.  An `http request` node that calls your simulated actuator API Gateway endpoint to "turn the light on".

*   **Day 12: Enhancing the Automation Flow & UI**
    *   [ ] Add a second output to the `switch` node to handle the "turn light off" condition (e.g., if `payload.light_intensity` >= 300).
    *   [ ] Implement a simple UI using `node-red-dashboard` nodes (`gauge`, `text`, `ui_switch`) to visualize the current sensor value and the simulated light state.

*   **Day 13: Error Handling & State Management**
    *   [ ] Improve your Node-RED flow and Lambda functions with basic error handling (e.g., using `try...catch` blocks and `catch` nodes).
    *   [ ] Create the `LightStates` DynamoDB table.
    *   [ ] Modify your `SimulatedLightActuator` Lambda to write the new state ("ON" or "OFF") to the `LightStates` table.

*   **Day 14: Weekly Review & Full Loop Test**
    *   [ ] Test the entire simulated loop end-to-end: Sensor script -> AWS IoT -> Lambda -> DynamoDB -> Node-RED -> API Gateway -> Actuator Lambda -> DynamoDB.
    *   [ ] Document the completed flow with screenshots and commit all work.
    *   [ ] Brainstorm the script needed for the scalability test: how to manage multiple device certificates and run concurrent connections.

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

*   **Day 18: Developing the Load-Testing Script**
    *   [ ] Create a new, more advanced Node.js or Python script designed for load testing.
    *   [ ] This script should be able to simulate hundreds of concurrent devices. It may need to manage multiple sets of device certificates or use a single, more permissive certificate for testing purposes.
    *   [ ] The script should publish messages on unique topics for each simulated device.

*   **Day 19: Executing Scalability Test v1**
    *   [ ] Run the load-test script with a moderate load (e.g., 100 devices sending a message every 5 seconds for 10 minutes).
    *   [ ] While the test is running, actively monitor your CloudWatch dashboard.
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
