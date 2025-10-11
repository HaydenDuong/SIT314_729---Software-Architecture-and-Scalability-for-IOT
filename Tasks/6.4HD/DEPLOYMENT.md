# IoT Smart Lighting System - Deployment Guide

## Architecture Overview

This is a microservices-based IoT system built with:
- **4 Microservices** (Express.js + Node.js)
- **MongoDB** for data persistence
- **Docker** for containerization
- **Kubernetes** for orchestration and auto-scaling
- **AWS IoT Core** for MQTT messaging

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Kubernetes Cluster                   │
│                                              │
│  ┌──────────────────────────────────┐       │
│  │   API Gateway (2-5 pods, HPA)    │       │
│  └─────────────┬────────────────────┘       │
│                │                             │
│      ┌─────────┼─────────┐                  │
│      │         │         │                  │
│  ┌───▼────┐ ┌─▼────┐ ┌──▼────┐             │
│  │Sensor  │ │Light │ │Auto   │             │
│  │Data    │ │Control│ │Rules  │             │
│  │(2-20)  │ │(2-10) │ │(3-15) │             │
│  │HPA     │ │HPA    │ │HPA    │             │
│  └───┬────┘ └──┬───┘ └───┬───┘             │
│      │         │         │                  │
│      └─────────┼─────────┘                  │
│                │                             │
│         ┌──────▼──────┐                     │
│         │  MongoDB    │                     │
│         │  Atlas      │                     │
│         └─────────────┘                     │
└─────────────────────────────────────────────┘
           ▲
           │ MQTT
           │
┌──────────┴──────────┐
│  AWS IoT Core        │
│  (MQTT Broker)       │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 5000+ IoT Sensors   │
│ (Simulators)        │
└─────────────────────┘
```

---

## 📋 Prerequisites

1. **Docker Desktop** with Kubernetes enabled
2. **kubectl** installed
3. **MongoDB Atlas** account (free tier)
4. **AWS IoT Core** setup (existing certificates)
5. **Node.js** 18+ (for local testing)

---

## 🚀 Quick Start

### Option 1: Docker Compose (Local Development)

1. **Set environment variables:**
```bash
# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iot_smart_lighting
IOT_HOST=a3gihr6flc6bqc-ats.iot.ap-southeast-2.amazonaws.com
EOF
```

2. **Build and run:**
```bash
docker-compose up --build
```

3. **Access services:**
- API Gateway: http://localhost:3000
- Sensor Data: http://localhost:3001
- Light Control: http://localhost:3002
- Automation: http://localhost:3003

---

### Option 2: Kubernetes (Production-like)

#### Step 1: Build Docker Images

```bash
# Build images
docker build -t iot-api-gateway:latest ./services/api-gateway
docker build -t iot-sensor-data-service:latest ./services/sensor-data-service
docker build -t iot-light-control-service:latest ./services/light-control-service
docker build -t iot-automation-service:latest ./services/automation-service
```

#### Step 2: Create MongoDB Secret

```bash
# Create secret with your MongoDB Atlas URI
kubectl create secret generic mongodb-secret \
  --from-literal=connectionString='mongodb+srv://username:password@cluster.mongodb.net/iot_smart_lighting'
```

#### Step 3: Deploy to Kubernetes

```bash
cd k8s
chmod +x deploy-all.sh
./deploy-all.sh
```

#### Step 4: Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get services

# Check HPAs
kubectl get hpa

# Watch auto-scaling in real-time
kubectl get hpa --watch
```

#### Step 5: Access API Gateway

```bash
# Port forward (for local Kubernetes)
kubectl port-forward service/api-gateway 3000:3000

# Or get external IP (for cloud Kubernetes)
kubectl get service api-gateway
```

---

## 🧪 Testing

### 1. Test Individual Services

```bash
# Health checks
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### 2. Run Sensor Simulators

```bash
# Run single sensor
node sensor-simulator.js

# Run load test with 5000 devices
MAX_CLIENTS=5000 node test-multiple-connections-singleproc.js
```

### 3. Monitor Auto-Scaling

```bash
# Watch HPA in action
kubectl get hpa --watch

# Watch pods scaling
kubectl get pods --watch

# Check resource usage
kubectl top pods
```

---

## 📊 Load Testing & Metrics

### Expected Auto-Scaling Behavior:

**Scenario: 5000 Concurrent Sensors**

| Time | Sensors | CPU Usage | Pods (Sensor Service) | Pods (Automation) |
|------|---------|-----------|----------------------|-------------------|
| 0min | 100     | 20%       | 2 (min)              | 3 (min)           |
| 2min | 1000    | 50%       | 4                    | 5                 |
| 5min | 3000    | 75%       | 12                   | 10                |
| 8min | 5000    | 80%       | 18                   | 14                |
| 15min| 1000    | 40%       | 8 (scaling down)     | 6                 |

---

## 🔧 Monitoring

### View Logs:
```bash
kubectl logs -f deployment/sensor-data-service
kubectl logs -f deployment/automation-service
kubectl logs -f deployment/api-gateway
```

### Get Metrics:
```bash
kubectl top pods
kubectl top nodes
```

### Describe HPA:
```bash
kubectl describe hpa sensor-data-service-hpa
```

---

## 🛑 Cleanup

### Docker Compose:
```bash
docker-compose down
```

### Kubernetes:
```bash
kubectl delete -f k8s/hpa/
kubectl delete -f k8s/deployments/
kubectl delete -f k8s/services/
kubectl delete -f k8s/configmaps/
kubectl delete secret mongodb-secret
```

---

## 📈 Scalability Features

1. **Horizontal Pod Autoscaling (HPA)**
   - CPU-based: Scale at 70% utilization
   - Memory-based: Scale at 80% utilization
   - Min/Max replicas per service

2. **Load Balancing**
   - Kubernetes Service load balancer
   - Round-robin distribution
   - Health checks for pod readiness

3. **Resource Limits**
   - Defined CPU/memory requests
   - Defined CPU/memory limits
   - Prevents resource starvation

4. **Self-Healing**
   - Liveness probes (restart if unhealthy)
   - Readiness probes (remove from service if not ready)
   - Auto-restart failed pods

---

## 🔍 Troubleshooting

### Pods not starting:
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### MongoDB connection issues:
```bash
# Check secret exists
kubectl get secret mongodb-secret

# Check secret content (base64 decoded)
kubectl get secret mongodb-secret -o jsonpath='{.data.connectionString}' | base64 --decode
```

### HPA not scaling:
```bash
# Ensure metrics-server is running
kubectl get deployment metrics-server -n kube-system

# Check HPA status
kubectl describe hpa sensor-data-service-hpa
```

---

## 📚 API Documentation

### API Gateway Endpoints:

**Health & Info:**
- `GET /` - System info
- `GET /health` - Health check all services

**Sensors:**
- `GET /api/sensors/readings` - Get sensor data
- `GET /api/sensors/readings/latest/:deviceId` - Latest reading
- `GET /api/sensors/stats` - Statistics
- `POST /api/sensors/readings` - Submit reading

**Lights:**
- `GET /api/lights/states` - All light states
- `GET /api/lights/state/:lightId` - Specific light
- `POST /api/lights/state` - Update light state
- `GET /api/lights/commands` - Command history
- `GET /api/lights/stats` - Statistics

**Automation:**
- `GET /api/automation/rules` - Get rules
- `PUT /api/automation/rules` - Update rules
- `POST /api/automation/process` - Trigger automation

**Dashboard:**
- `GET /api/dashboard/overview` - System overview

---

## 💡 Next Steps

1. **Production Deployment:**
   - Deploy to AWS EKS or GKE
   - Setup Ingress controller
   - Configure TLS/SSL

2. **Monitoring:**
   - Add Prometheus for metrics
   - Setup Grafana dashboards
   - Configure alerts

3. **Advanced Scaling:**
   - Custom metrics (MQTT messages/sec)
   - Predictive scaling
   - Vertical Pod Autoscaler

---

For questions or issues, see the main README.md

