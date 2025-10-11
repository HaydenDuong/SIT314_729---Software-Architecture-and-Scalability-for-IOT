# Project: Scalable Smart Home Lighting System (6.4HD - Microservices Edition)
This repository contains the code and documentation for a scalable, intelligent, and secure smart home lighting system. This is the **6.4HD High Distinction version** using microservices architecture with Docker and Kubernetes for IoT scalability research.

## Version History
- **6.3D**: Serverless architecture (AWS Lambda + DynamoDB) - Distinction grade achieved
- **6.4HD**: Microservices architecture (Express + MongoDB + Docker + Kubernetes) - Current version

---

## Project Overview & Objectives
The primary goal of this project is to address the common limitations of existing smart lighting systems, such as complex setups, interoperability issues, and a lack of true adaptability. The system will not only allow for remote control but will also intelligently adjust lighting based on real-time environmental data (e.g., light intensity and occupancy), optimizing energy consumption and enhancing the user experience.

### Key Objectives (6.4HD):
- **Microservices Architecture**: Implement a cloud-native, containerized microservices architecture using Docker and Kubernetes
- **Horizontal Scalability**: Demonstrate auto-scaling from 2 to 20+ pods based on CPU/memory metrics using Kubernetes HPA
- **Cloud-Agnostic Design**: Use portable technologies (Docker, Kubernetes, MongoDB) that can run on any cloud provider or on-premises
- **REST API-based Communication**: Microservices communicate via RESTful APIs for loose coupling
- **IoT-Specific Scaling**: Research and implement scaling strategies suitable for I/O-bound IoT workloads (not just CPU-based)
- **Load Testing**: Prove scalability with 5000+ concurrent simulated IoT devices
- **State-of-the-Art Research**: Apply published research on IoT scalability patterns including:
  - Event-driven architecture
  - Microservices decomposition
  - Container orchestration
  - NoSQL horizontal scaling
  - API Gateway patterns

---

## Architecture (6.4HD Microservices)

### System Components:

**1. IoT Device Layer:**
- **Simulated Sensors** (`sensor-simulator.js`): Generates realistic ambient light and motion data
- **Load Testing** (`test-multiple-connections-singleproc.js`): Simulates up to 5000+ concurrent devices
- **AWS IoT Core**: MQTT broker for secure device-to-cloud communication

**2. Kubernetes Cluster (Microservices Layer):**

- **API Gateway Service** (Port 3000)
  - Entry point for all external requests
  - Routes requests to appropriate microservices
  - Rate limiting and request forwarding
  - Auto-scales: 2-5 pods

- **Sensor Data Service** (Port 3001)
  - Subscribes to MQTT topics from AWS IoT Core
  - Stores sensor readings in MongoDB
  - Exposes REST API for querying sensor data
  - Auto-scales: 2-20 pods (most I/O intensive)

- **Light Control Service** (Port 3002)
  - Manages light states in MongoDB
  - Detects state changes to prevent duplicate commands
  - Records command history
  - Auto-scales: 2-10 pods

- **Automation Service** (Port 3003)
  - Implements business logic (motion + light intensity rules)
  - Calls Light Control Service via REST API
  - Subscribes to MQTT for real-time automation
  - Auto-scales: 3-15 pods

**3. Data Layer:**
- **MongoDB Atlas**: NoSQL database with horizontal scaling
  - Collections: `sensor_readings`, `light_states`, `light_commands`
  - Indexed queries for performance

**4. Orchestration:**
- **Docker**: Containerization of each microservice
- **Kubernetes**: Orchestration, auto-scaling (HPA), load balancing, self-healing
- **Horizontal Pod Autoscaler**: Scales based on CPU (5-10%) and memory (60%) usage

### Technology Stack:
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **MQTT Broker**: AWS IoT Core
- **Load Testing**: Custom Node.js simulators

---

## Quick Start

### Prerequisites:
- Docker Desktop with Kubernetes enabled
- MongoDB Atlas account (free tier)
- AWS IoT Core certificates (in `certificates/` folder)

### Option 1: Docker Compose (Easiest)
```bash
# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI

# Start all services
docker-compose up --build

# Access API Gateway
curl http://localhost:3000/health
```

### Option 2: Kubernetes (Production-like)
```bash
# Build Docker images
./build-images.sh

# Deploy to Kubernetes
cd k8s
./deploy-all.sh

# Watch auto-scaling
kubectl get hpa --watch
```

### Run Load Test:
```bash
# Test with 5000 concurrent devices
MAX_CLIENTS=5000 node test-multiple-connections-singleproc.js
```

See `DEPLOYMENT.md` for detailed instructions.

---

## Files Structure
```
├── services/
│   ├── api-gateway/          # API Gateway microservice
│   ├── sensor-data-service/  # Sensor data ingestion
│   ├── light-control-service/# Light state management
│   └── automation-service/   # Business logic
├── k8s/
│   ├── deployments/          # Kubernetes deployments
│   ├── services/             # Kubernetes services
│   ├── hpa/                  # Auto-scaling configs
│   └── configmaps/           # Configuration
├── certificates/             # AWS IoT Core certs
├── sensor-simulator.js       # Single device simulator
├── test-multiple-connections-singleproc.js  # Load tester
├── docker-compose.yml        # Local development
└── DEPLOYMENT.md            # Full deployment guide
```

---

## Key Features for HD Report

1. **Horizontal Pod Autoscaling**: Automatically scales from 2 to 20 pods based on load
2. **IoT-Specific Thresholds**: Uses 5-10% CPU (IoT is I/O-bound, not CPU-bound)
3. **Self-Healing**: Kubernetes restarts failed pods automatically
4. **Load Balancing**: Distributes 5000+ sensor connections across pods
5. **State Change Detection**: Prevents duplicate commands (optimization)
6. **Cloud-Agnostic**: Can run on any Kubernetes cluster (AWS, GCP, Azure, on-prem)

---

For questions or deployment issues, see DEPLOYMENT.md or raise an issue.

