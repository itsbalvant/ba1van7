#!/bin/bash

# Goal Tracker - Server Startup Script
# This script starts a secure HTTP server for the Goal Tracker application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT=8000
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_SCRIPT="$SCRIPT_DIR/server.py"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Goal Tracker - Server Startup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed!${NC}"
    echo "Please install Python 3 to run the server."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}Python version: $PYTHON_VERSION${NC}"

# Check if server.py exists
if [ ! -f "$SERVER_SCRIPT" ]; then
    echo -e "${RED}Error: server.py not found!${NC}"
    exit 1
fi

# Make server.py executable
chmod +x "$SERVER_SCRIPT"

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}Warning: Port $PORT is already in use!${NC}"
    echo "Trying to kill the process using port $PORT..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Check for required files
REQUIRED_FILES=("index.html" "styles.css" "script.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$SCRIPT_DIR/$file" ]; then
        echo -e "${YELLOW}Warning: $file not found in $SCRIPT_DIR${NC}"
    fi
done

echo -e "\n${GREEN}Starting secure HTTP server...${NC}\n"

# Start the server
cd "$SCRIPT_DIR"
python3 "$SERVER_SCRIPT"
