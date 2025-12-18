#!/bin/bash

# ADX-Agent Interactive Coding Assistant - Quick Setup Script
# This script automates the initial Docker deployment process

set -e

echo "🚀 ADX-Agent Interactive Coding Assistant - Quick Setup"
echo "=================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check available ports
echo "🔍 Checking available ports..."
ports=(3000 8000 5432 6379 5900 6080)
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use"
    fi
done

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your API keys."
    echo "   Required: E2B_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY"
else
    echo "✅ .env file already exists"
fi

# Generate SSL certificates
echo "🔒 Generating SSL certificates..."
if [ ! -f ssl/cert.pem ]; then
    cd ssl
    chmod +x generate-certs.sh
    ./generate-certs.sh
    cd ..
    echo "✅ SSL certificates generated"
else
    echo "✅ SSL certificates already exist"
fi

# Build and start services
echo "🏗️  Building and starting Docker services..."
docker-compose -f docker-compose.full.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.full.yml build --no-cache
docker-compose -f docker-compose.full.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Health checks
echo "🏥 Running health checks..."

# Check web application
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Web Application: Running on http://localhost:3000"
else
    echo "❌ Web Application: Not responding"
fi

# Check backend API
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend API: Running on http://localhost:8000"
else
    echo "❌ Backend API: Not responding"
fi

# Check VNC access
if curl -f http://localhost:6080 >/dev/null 2>&1; then
    echo "✅ VNC Desktop: Accessible on http://localhost:6080"
else
    echo "❌ VNC Desktop: Not accessible"
fi

# Check database
if docker-compose -f docker-compose.full.yml exec -T database pg_isready -U agent_user >/dev/null 2>&1; then
    echo "✅ PostgreSQL Database: Running on port 5432"
else
    echo "❌ PostgreSQL Database: Not responding"
fi

# Check Redis
if docker-compose -f docker-compose.full.yml exec -T redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis: Running on port 6379"
else
    echo "❌ Redis: Not responding"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "🌐 Access Points:"
echo "   • Main Application: http://localhost:3000"
echo "   • API Documentation: http://localhost:8000/docs"
echo "   • VNC Web Interface: http://localhost:6080"
echo "   • Monitoring Dashboard: http://localhost:3001"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.full.yml ps
echo ""
echo "📖 For detailed documentation, see SETUP-INSTRUCTIONS.md"
echo "🔧 To view logs: docker-compose -f docker-compose.full.yml logs -f"
echo "🛑 To stop services: docker-compose -f docker-compose.full.yml down"