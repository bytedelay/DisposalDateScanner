#!/usr/bin/env bash
set -e

echo "=== Running Python script ==="
python3 ./img2txt.py "$@"

echo -e "\n=== Running WhatsApp Scheduler ==="
cd whatsapp-scheduler
node index.js
