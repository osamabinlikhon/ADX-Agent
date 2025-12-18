#!/bin/bash

# Desktop Environment Startup Script for E2B Desktop SDK

set -e

echo "🚀 Starting Desktop Environment Sandbox..."

# Set up X11 virtual display
echo "📺 Setting up virtual display..."
Xvfb :0 -screen 0 1920x1080x24 &
XVFB_PID=$!
export DISPLAY=:0

# Wait for X11 to be ready
sleep 3

# Set up VNC password if exists
if [ -f /root/.vnc/passwd ]; then
    echo "🔒 VNC password configured"
fi

# Start VNC server
echo "🌐 Starting VNC server..."
x11vnc -display :0 -forever -shared -rfbport 5900 -noshm -noreset &
VNC_PID=$!
echo "VNC server started on port 5900"

# Start noVNC web interface
echo "🌍 Starting noVNC web interface..."
cd /opt/noVNC && python3 /opt/noVNC/utils/websockify/run \
    6080 localhost:5900 \
    --web /opt/noVNC \
    --ssl-cert /opt/noVNC/utils/websockify/ssl/cert.pem \
    --ssl-key /opt/noVNC/utils/websockify/ssl/key.pem &
NOVNC_PID=$!
echo "noVNC web interface started on port 6080"

# Start desktop environment in background
echo "🖥️ Starting XFCE desktop environment..."
xfce4-session &
XFCE_PID=$!
echo "Desktop environment started"

# Start web server for application
echo "🔧 Starting application server..."
python3 app.py &
APP_PID=$!
echo "Application server started"

# Function to handle shutdown
shutdown() {
    echo "🛑 Shutting down services..."
    kill $XVFB_PID $VNC_PID $NOVNC_PID $XFCE_PID $APP_PID 2>/dev/null || true
    exit 0
}

# Trap shutdown signals
trap shutdown SIGTERM SIGINT

# Health check
echo "🏥 Running health checks..."
sleep 5

# Check if services are running
if pgrep -f "Xvfb" > /dev/null && \
   pgrep -f "x11vnc" > /dev/null && \
   pgrep -f "xfce4-session" > /dev/null; then
    echo "✅ All services are running successfully!"
    echo "📱 Access points:"
    echo "   • VNC: vnc://localhost:5900"
    echo "   • Web: http://localhost:6080"
    echo "   • App API: http://localhost:8080"
else
    echo "❌ Some services failed to start"
    exit 1
fi

# Keep container running and monitor services
echo "⏰ Monitoring services (press Ctrl+C to stop)..."
while true; do
    sleep 30
    
    # Check if any process died and restart if needed
    if ! pgrep -f "Xvfb" > /dev/null; then
        echo "⚠️ Xvfb died, restarting..."
        Xvfb :0 -screen 0 1920x1080x24 &
        XVFB_PID=$!
    fi
    
    if ! pgrep -f "x11vnc" > /dev/null; then
        echo "⚠️ VNC server died, restarting..."
        x11vnc -display :0 -forever -shared -rfbport 5900 -noshm -noreset &
        VNC_PID=$!
    fi
done
