#!/bin/bash

echo "🚀 PrimeTrade Quick Start Script"
echo "================================="
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    brew services start mongodb-community 2>/dev/null || mongod --fork --logpath /tmp/mongodb.log --dbpath ~/data/db 2>/dev/null
    sleep 2
else
    echo "✅ MongoDB is already running"
fi

# Backend setup
echo ""
echo "🔧 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual values!"
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo ""
echo "🎯 Starting Backend Server on http://localhost:5000"
npm run dev &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Frontend setup
echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo ""
echo "🎯 Starting Frontend on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📍 Backend API: http://localhost:5000"
echo "📍 Health Check: http://localhost:5000/health"
echo "📍 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
