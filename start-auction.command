#!/bin/bash
# Football Auction Start Script
# Double-click this file to start the auction server

# Change to the script's directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo "Starting Football Auction Server..."
    echo ""
    node server.js
else
    echo "Node.js not found. Trying Python instead..."
    echo ""
    if command -v python3 &> /dev/null; then
        echo "Starting with Python server..."
        echo ""
        echo "==========================================="
        echo "   FOOTBALL AUCTION SERVER STARTED"
        echo "==========================================="
        echo ""
        echo "   Presentation View: http://localhost:3000/"
        echo "   Control Panel:     http://localhost:3000/control.html"
        echo ""
        echo "   Press Ctrl+C to stop the server"
        echo "==========================================="
        echo ""
        python3 -m http.server 3000
    else
        echo "ERROR: Neither Node.js nor Python3 found!"
        echo "Please install Node.js from https://nodejs.org"
        read -p "Press Enter to exit..."
    fi
fi
