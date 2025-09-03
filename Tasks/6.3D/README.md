# Project: Scalable Smart Home Lighting System
This repository contains the code and documentation for a scalable, intelligent, and secure smart home lighting system. The project is designed to fulfill the requirements for the SIT314 unit's distinction project by demonstrating a robust, cloud-native IoT solution with a strong focus on scalability.

---

## Project Overview & Objectives
The primary goal of this project is to address the common limitations of existing smart lighting systems, such as complex setups, interoperability issues, and a lack of true adaptability. The system will not only allow for remote control but will also intelligently adjust lighting based on real-time environmental data (e.g., light intensity and occupancy), optimizing energy consumption and enhancing the user experience.

### Key Objectives:
- **Design & Architecture**: Develop a robust, event-driven, and microservices-based architecture that is inherently scalable. The solution will leverage core AWS services, Node-RED, and Node.js.
- **Scalable Solution**: Demonstrate that the system can handle a large number of devices and data streams without performance degradation. This will be proven through scalability experiments using simulated devices and documented evidence from AWS CloudWatch metrics.
- **Functional Prototype**: Build a functional prototype capable of controlling multiple lights based on automation rules. This prototype will use software simulators for both sensors and actuators, which is the accepted standard for this unit.
- **Data Flow & Processing**: Implement a complete data flow from simulated sensors, through the AWS cloud, to simulated actuators. This includes:
    - **Data Ingestion**: Using AWS IoT Core as the messaging broker.
    - **Data Processing**: Implementing simple, rule-based logic in Node-RED and complex business logic in AWS Lambda microservices.
    - **Data Storage**: Storing sensor data, device states, and user rules in AWS DynamoDB due to its scalability for high-velocity data.
    - **Security & Monitoring**: Ensure a secure deployment by following the principle of least privilege with IAM roles and secure device policies. Monitor key system metrics using AWS CloudWatch dashboards to track performance and errors.
    - **Comprehensive Documentation**: Provide a link to this GitHub repository with the complete source code and a final project report that includes evidence of scalability and a discussion of the solution's appropriateness.

---

## High-Level System Components
The solution is comprised of five main components that work together in an interconnected system:
- **Simulated Sensors**: Scripts that generate and publish realistic data for ambient light, PIR motion, and door/window states.
- **IoT Gateway**: A Node-RED instance that acts as a bridge, collecting sensor data via MQTT and forwarding it to the cloud.
- **Cloud Platform (AWS)**: The central processing and storage backbone. This includes:
    - **AWS IoT Core**: For secure device-to-cloud communication.
    - **AWS Lambda**: Serverless microservices for data processing and business logic.
    - **AWS DynamoDB**: A NoSQL database for storing all collected data and configurations.
    - **AWS API Gateway**: Exposing a RESTful API for external control and actuator simulation.
- **Actuators**: Simulated APIs or messages that control the state of lights and switches.
- **User Interface**: A simple dashboard built with Node-RED to monitor sensor data and visualize the light state.

This architecture provides the foundation for an intelligent and adaptable smart home solution, with the capacity to scale to support a large number of devices.





