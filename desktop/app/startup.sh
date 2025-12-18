#!/bin/bash

# Desktop Environment Startup Script for E2B Desktop SDK + MCP Integration
# Enhanced with Model Context Protocol (MCP) gateway support

set -e

echo "🚀 Starting Desktop Environment Sandbox with MCP Integration..."

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

# Install Node.js if not present (required for MCP gateway)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js for MCP gateway..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install MCP gateway dependencies
echo "🔧 Installing MCP gateway dependencies..."
npm install -g @e2b/mcp-gateway @e2b/sandbox || {
    echo "⚠️ Global MCP installation failed, using local installation"
    cd /tmp && npm init -y && npm install @e2b/mcp-gateway @e2b/sandbox
    export PATH="/tmp/node_modules/.bin:$PATH"
}

# Set up MCP environment
echo "🔗 Setting up MCP environment..."
export MCP_CONFIG_PATH="/app/config/mcp-config.json"
export MCP_TOOLS_PATH="/app/config/tools"
export MCP_LOG_LEVEL="${LOG_LEVEL:-INFO}"

# Create MCP runtime directory
mkdir -p /app/mcp-runtime
cd /app/mcp-runtime

# Initialize MCP configuration if not exists
if [ ! -f "mcp-runtime.json" ]; then
    echo "⚙️ Initializing MCP runtime..."
    cat > mcp-runtime.json << 'EOF'
{
  "version": "1.0",
  "name": "ADX-Agent MCP Runtime",
  "tools": {
    "github": {
      "command": "npx",
      "args": ["@github/mcp", "server"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "browserbase": {
      "command": "npx", 
      "args": ["@browserbase/mcp", "server"],
      "env": {
        "BROWSERBASE_API_KEY": "${BROWSERBASE_API_KEY}",
        "BROWSERBASE_PROJECT_ID": "${BROWSERBASE_PROJECT_ID}",
        "GOOGLE_GENERATIVE_AI_API_KEY": "${GOOGLE_GENERATIVE_AI_API_KEY}"
      }
    },
    "exa": {
      "command": "npx",
      "args": ["@exa-labs/mcp", "server"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      }
    }
  }
}
EOF
fi

# Start MCP gateway server
echo "🌐 Starting MCP gateway server..."
export MCP_GATEWAY_PORT=8080
export MCP_GATEWAY_HOST=0.0.0.0

# Start MCP gateway in background
npx @e2b/mcp-gateway \
    --port $MCP_GATEWAY_PORT \
    --host $MCP_GATEWAY_HOST \
    --config $MCP_CONFIG_PATH \
    --runtime mcp-runtime.json \
    --log-level $MCP_LOG_LEVEL \
    --cors-enabled \
    --auth-enabled \
    --max-connections 100 \
    --timeout 120000 &
MCP_PID=$!
echo "MCP gateway started on port $MCP_GATEWAY_PORT"

# Wait for MCP gateway to be ready
echo "⏳ Waiting for MCP gateway to be ready..."
sleep 5

# Verify MCP gateway is running
if curl -f -s http://localhost:$MCP_GATEWAY_PORT/health > /dev/null; then
    echo "✅ MCP gateway is healthy and ready"
else
    echo "⚠️ MCP gateway health check failed, but continuing..."
fi

# Start web server for application
echo "🔧 Starting application server..."
python3 app.py &
APP_PID=$!
echo "Application server started"

# Create MCP status endpoint
echo "📊 Creating MCP status endpoint..."
cat > /app/mcp-status.py << 'EOF'
#!/usr/bin/env python3
import json
import requests
import time
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/mcp/status')
def mcp_status():
    try:
        # Check MCP gateway health
        mcp_health = requests.get('http://localhost:8080/health', timeout=5).json()
        
        # Check configured tools
        tools_status = {}
        for tool in ['github', 'browserbase', 'exa']:
            try:
                response = requests.get(f'http://localhost:8080/tools/{tool}/health', timeout=3)
                tools_status[tool] = {
                    'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                    'response_code': response.status_code
                }
            except:
                tools_status[tool] = {'status': 'unknown', 'response_code': 'error'}
        
        return jsonify({
            'mcp_gateway': mcp_health,
            'tools': tools_status,
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error',
            'timestamp': time.time()
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=False)
EOF

# Start MCP status monitoring
echo "📈 Starting MCP status monitoring..."
python3 /app/mcp-status.py &
MCP_STATUS_PID=$!
echo "MCP status monitoring started on port 8081"

# Function to handle shutdown
shutdown() {
    echo "🛑 Shutting down services..."
    
    # Stop MCP gateway
    if [ ! -z "$MCP_PID" ]; then
        echo "🛑 Stopping MCP gateway..."
        kill $MCP_PID 2>/dev/null || true
    fi
    
    # Stop MCP status monitor
    if [ ! -z "$MCP_STATUS_PID" ]; then
        echo "🛑 Stopping MCP status monitor..."
        kill $MCP_STATUS_PID 2>/dev/null || true
    fi
    
    # Stop original services
    kill $XVFB_PID $VNC_PID $NOVNC_PID $XFCE_PID $APP_PID 2>/dev/null || true
    exit 0
}

# Trap shutdown signals
trap shutdown SIGTERM SIGINT

# Health check
echo "🏥 Running comprehensive health checks..."
sleep 5

# Check if services are running
if pgrep -f "Xvfb" > /dev/null && \
   pgrep -f "x11vnc" > /dev/null && \
   pgrep -f "xfce4-session" > /dev/null && \
   pgrep -f "@e2b/mcp-gateway" > /dev/null; then
    echo "✅ All services are running successfully!"
    echo "📱 Access points:"
    echo "   • VNC: vnc://localhost:5900"
    echo "   • Web: http://localhost:6080"
    echo "   • App API: http://localhost:8080"
    echo "   • MCP Gateway: http://localhost:8080"
    echo "   • MCP Status: http://localhost:8081/mcp/status"
    echo ""
    echo "🔧 Available MCP Tools:"
    echo "   • GitHub: Repository management"
    echo "   • Browserbase: Web automation"
    echo "   • Exa: AI-powered search"
else
    echo "❌ Some services failed to start"
    echo "🔍 Debug information:"
    echo "   • Xvfb: $(pgrep -f 'Xvfb' || echo 'Not running')"
    echo "   • VNC: $(pgrep -f 'x11vnc' || echo 'Not running')"
    echo "   • Desktop: $(pgrep -f 'xfce4-session' || echo 'Not running')"
    echo "   • MCP Gateway: $(pgrep -f '@e2b/mcp-gateway' || echo 'Not running')"
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
    
    # Check MCP gateway health
    if ! curl -f -s http://localhost:8080/health > /dev/null 2>&1; then
        echo "⚠️ MCP gateway died, restarting..."
        if [ ! -z "$MCP_PID" ]; then
            kill $MCP_PID 2>/dev/null || true
        fi
        
        npx @e2b/mcp-gateway \
            --port $MCP_GATEWAY_PORT \
            --host $MCP_GATEWAY_HOST \
            --config $MCP_CONFIG_PATH \
            --runtime mcp-runtime.json \
            --log-level $MCP_LOG_LEVEL \
            --cors-enabled \
            --auth-enabled &
        MCP_PID=$!
    fi
done