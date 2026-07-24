#!/bin/bash

# Stop script execution if any command fails
set -e

echo "Starting the Layerzero with Docker Compose..."

# Build the images (if changes were made) and start containers in the background
docker compose up --build -d

echo "Layerzero is running and to stop, run 'docker compose down'."