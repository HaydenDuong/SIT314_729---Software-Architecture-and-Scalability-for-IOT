#!/bin/bash

echo "🚀 Deploying IoT Smart Lighting System to Kubernetes"
echo "======================================================"

# Create ConfigMaps
echo "📋 Creating ConfigMaps..."
kubectl apply -f configmaps/iot-config.yaml

# Create Secret (you need to edit this with your MongoDB URI first!)
echo "🔐 Creating Secrets..."
echo "⚠️  Make sure you've created the mongodb-secret first:"
echo "    kubectl create secret generic mongodb-secret --from-literal=connectionString='your-mongodb-uri'"

# Deploy Services
echo "🔧 Creating Services..."
kubectl apply -f services/

# Deploy Applications
echo "📦 Creating Deployments..."
kubectl apply -f deployments/

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
sleep 10

# Deploy HPAs
echo "📈 Creating Horizontal Pod Autoscalers..."
kubectl apply -f hpa/

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Check status with:"
echo "   kubectl get pods"
echo "   kubectl get services"
echo "   kubectl get hpa"
echo ""
echo "🔍 View logs:"
echo "   kubectl logs -f deployment/api-gateway"
echo "   kubectl logs -f deployment/sensor-data-service"
echo ""
echo "🌐 Access API Gateway:"
echo "   kubectl get service api-gateway"
echo "   (Use EXTERNAL-IP or port-forward: kubectl port-forward service/api-gateway 3000:3000)"

