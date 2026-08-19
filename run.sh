#!/usr/bin/env bash

# Stop execution if any command fails
set -e

echo "=== Running Python script ==="
python3 ./img2txt.py "$@"

echo -e "\n=== Setting up Node.js environment ==="
cd whatsapp-scheduler

# Initialize package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "Initializing npm package..."
    npm init -y
fi

# Install required dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "Installing required npm dependencies..."
    npm install whatsapp-web.js qrcode-terminal node-cron csv-parser date-fns
fi

echo -e "\n=== Running WhatsApp Scheduler ==="
node index.js
