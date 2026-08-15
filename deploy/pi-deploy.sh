#!/bin/bash
# GodChair — Raspberry Pi 4 Deployment Script
# Run this on your Pi after cloning the project
set -e

echo "========================================"
echo "  GodChair Pi 4 Deployment"
echo "========================================"

# Check we're on a Pi (or at least Debian-based)
if ! command -v node &> /dev/null; then
  echo "Node.js not found. Installing Node 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Node version: $(node -v)"

# Install dependencies
echo "Installing dependencies..."
npm ci --omit=dev

# Build the project
echo "Building GodChair..."
npm run build

# Copy systemd service
echo "Setting up systemd service..."
sudo cp deploy/godchair.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable godchair
sudo systemctl restart godchair

echo ""
echo "========================================"
echo "  Deployment Complete!"
echo "========================================"
echo ""
echo "GodChair is now running on port 3000"
echo ""
echo "Access it at:"
echo "  Local:   http://localhost:3000"
echo "  Network: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "Management commands:"
echo "  Status:  sudo systemctl status godchair"
echo "  Stop:    sudo systemctl stop godchair"
echo "  Start:   sudo systemctl start godchair"
echo "  Restart: sudo systemctl restart godchair"
echo "  Logs:    sudo journalctl -u godchair -f"
echo ""
