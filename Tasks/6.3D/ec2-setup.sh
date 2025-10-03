#!/bin/bash

# EC2 Setup Script for Node-RED Deployment
# Run this script on your EC2 instance after SSH connection

echo "Starting EC2 setup for Node-RED deployment..."

# Update system
sudo yum update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install Node-RED globally
sudo npm install -g --unsafe-perm node-red

# Install required Node-RED nodes
npm install -g node-red-contrib-aws-iot-hub
npm install -g node-red-dashboard

# Create Node-RED service user
sudo useradd --system --no-create-home --shell /bin/false node-red

# Create Node-RED directory
sudo mkdir /opt/node-red
sudo chown node-red:node-red /opt/node-red

# Create Node-RED service file
sudo tee /etc/systemd/system/node-red.service > /dev/null <<EOF
[Unit]
Description=Node-RED
After=syslog.target network.target

[Service]
ExecStart=/usr/bin/node-red --userDir /opt/node-red
Restart=on-failure
KillSignal=SIGINT
User=node-red
Group=node-red

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start Node-RED
sudo systemctl daemon-reload
sudo systemctl enable node-red
sudo systemctl start node-red

# Check status
sudo systemctl status node-red

echo "Node-RED setup complete!"
echo "Node-RED should be accessible at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):1880"
echo "To check logs: sudo journalctl -u node-red -f"
