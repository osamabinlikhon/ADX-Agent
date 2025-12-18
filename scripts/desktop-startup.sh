#!/bin/bash

# Desktop Environment Startup Script

# Set up X11 virtual display
Xvfb :0 -screen 0 1920x1080x24 &
export DISPLAY=:0

# Wait for X11 to be ready
sleep 2

# Set up VNC password if exists
if [ -f /root/.vnc/passwd ]; then
    echo "VNC password configured"
fi

# Start VNC server
x11vnc -display :0 -forever -shared -rfbport 5900 &
echo "VNC server started on port 5900"

# Start noVNC web interface
cd /opt/noVNC && python3 /opt/noVNC/utils/websockify/run \
    6080 localhost:5900 \
    --web /opt/noVNC &
echo "noVNC web interface started on port 6080"

# Start desktop environment in background
xfce4-session &
echo "Desktop environment started"

# Keep container running
echo "Desktop environment is ready!"
echo "VNC access: vnc://localhost:5900"
echo "Web interface: http://localhost:6080"

# Wait forever
tail -f /dev/null
