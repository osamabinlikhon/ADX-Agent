# ADX-Agent Interactive Coding Assistant - Complete Setup Guide

## 🚀 Overview

The ADX-Agent Interactive Coding Assistant is a sophisticated full-stack application that enables AI agents to control desktop environments through multimodal understanding and real-time interaction. This guide provides complete setup instructions for local development and production deployment.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows with WSL2
- **Docker**: Version 20.10+ and Docker Compose v2+
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: At least 10GB free space
- **Network**: Ports 3000, 8000, 5432, 6379, 5900, 6080 available

### API Keys Required
- **E2B API Key**: Get from [e2b.dev](https://e2b.dev)
- **Google Generative AI API Key**: Get from [aistudio.google.com](https://aistudio.google.com/app/apikey)
- **HuggingFace Token**: Required for advanced AI models

## 🛠️ Installation & Setup

### Step 1: Clone and Navigate to Project
```bash
git clone <repository-url>
cd interactive-coding-assistant
```

### Step 2: Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your API keys
nano .env
```

**Required Environment Variables:**
```bash
# Essential API Keys
E2B_API_KEY=your_e2b_api_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here

# Database Security
DB_PASSWORD=your_secure_database_password
REDIS_PASSWORD=your_secure_redis_password

# Optional: VNC Access
VNC_PASSWORD=your_vnc_password

# Optional: Monitoring
GRAFANA_PASSWORD=your_grafana_password
```

### Step 3: Generate SSL Certificates (Production)
```bash
# Navigate to SSL directory
cd ssl

# Generate self-signed certificates for development
chmod +x generate-certs.sh
./generate-certs.sh

# Return to project root
cd ..
```

### Step 4: Build and Start Services

#### Option A: Full Production Stack
```bash
# Build and start all services
docker-compose -f docker-compose.full.yml up --build -d

# Check service status
docker-compose -f docker-compose.full.yml ps
```

#### Option B: Development Stack (Simplified)
```bash
# Start with minimal services
docker-compose up --build -d

# View logs
docker-compose logs -f
```

## 🏗️ Architecture Overview

### Service Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx Load Balancer                   │
│                        (Port 80/443)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼─────┐ ┌────▼────────┐
│   Web App    │ │ Backend  │ │   Sandbox   │
│  (React 19)  │ │(FastAPI) │ │ (Desktop)   │
│  Port 3000   │ │Port 8000 │ │ Ports 6080  │
└──────────────┘ └──────────┘ └─────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼────────┐ ┌──▼────────┐
│ PostgreSQL   │ │   Redis     │ │ Monitoring│
│ Port 5432    │ │ Port 6379   │ │ Port 3001 │
└──────────────┘ └─────────────┘ └───────────┘
```

### Component Details

#### Frontend (React 19 + Next.js + Ant Design X)
- **Port**: 3000
- **Framework**: Next.js 14 with React 19
- **UI Library**: Ant Design X with custom theming
- **Features**: Real-time chat interface, desktop streaming viewer, agent workspace

#### Backend (FastAPI + E2B Integration)
- **Port**: 8000
- **Framework**: FastAPI with async support
- **AI Integration**: Gemini API + E2B Desktop SDK
- **Features**: WebSocket support, multimodal AI processing, desktop automation

#### Desktop Sandbox (E2B Environment)
- **VNC Port**: 5900
- **Web Interface**: 6080
- **Environment**: Ubuntu + XFCE + noVNC
- **Features**: Isolated desktop environment, browser automation, development tools

#### Database Services
- **PostgreSQL 15**: Agent sessions, chat history, system logs
- **Redis 7**: Session management, caching, real-time data
- **Grafana**: Monitoring and analytics dashboard

## 🌐 Access Points

After successful deployment, access your application at:

### Development Access
- **Main Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Desktop Web Interface**: http://localhost:6080

### Production Access (with SSL)
- **Main Application**: https://localhost
- **Backend API**: https://localhost/api
- **Monitoring Dashboard**: http://localhost:3001

### VNC Direct Access
- **VNC Viewer**: vnc://localhost:5900
- **Web-based VNC**: http://localhost:6080/vnc.html

## 🔧 Configuration Details

### Docker Services Configuration

#### Web Application Service
```yaml
web-app:
  build:
    context: .
    dockerfile: Dockerfile.web
  ports:
    - "3000:3000"
  environment:
    - NODE_ENV=production
    - NEXT_PUBLIC_API_URL=http://backend:8000
    - GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_GENERATIVE_AI_API_KEY}
    - E2B_API_KEY=${E2B_API_KEY}
```

#### Backend Service
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  ports:
    - "8000:8000"
  environment:
    - E2B_API_KEY=${E2B_API_KEY}
    - GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_GENERATIVE_AI_API_KEY}
    - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@database:5432/agent_db
    - REDIS_URL=redis://redis:6379
```

#### Sandbox Service
```yaml
sandbox:
  build:
    context: ./sandbox
    dockerfile: Dockerfile
  ports:
    - "6080:6080"  # noVNC web interface
    - "5900:5900"  # VNC server
  environment:
    - DISPLAY=:0
    - VNC_PORT=5900
    - VNC_PASSWORD=${VNC_PASSWORD}
```

### Database Configuration

#### PostgreSQL Setup
```sql
-- Database: agent_db
-- User: agent_user
-- Tables: agent_sessions, chat_messages, agent_actions, system_logs
```

#### Redis Configuration
```redis
-- Port: 6379
-- Authentication: Required
-- Persistence: AOF enabled
-- Memory: 512MB max
```

## 🔍 Monitoring & Health Checks

### Service Health Monitoring
```bash
# Check all service status
docker-compose -f docker-compose.full.yml ps

# View service logs
docker-compose -f docker-compose.full.yml logs [service-name]

# Monitor real-time logs
docker-compose -f docker-compose.full.yml logs -f --tail=50
```

### Individual Service Health
```bash
# Web Application Health
curl http://localhost:3000/api/health

# Backend Health
curl http://localhost:8000/health

# Database Connection
docker-compose exec database psql -U agent_user -d agent_db -c "SELECT 1;"

# Redis Connection
docker-compose exec redis redis-cli ping
```

### Performance Monitoring
- **Grafana Dashboard**: http://localhost:3001
- **Default Login**: admin/admin (change on first login)
- **Monitoring Metrics**: CPU, Memory, Network, Disk usage

## 🛠️ Development Workflow

### Local Development Setup
```bash
# Backend Development
cd backend
pip install -r requirements.txt
python main.py

# Frontend Development
cd frontend
npm install
npm run dev

# Sandbox Development
cd sandbox
./startup.sh
```

### Code Changes and Hot Reloading
- **Frontend**: Hot reloading enabled via Next.js
- **Backend**: Auto-restart via Docker volume mounting
- **Sandbox**: Manual restart required for system changes

### Testing
```bash
# Backend Tests
cd backend && python -m pytest tests/

# Frontend Tests
cd frontend && npm test

# Integration Tests
docker-compose -f docker-compose.full.yml exec backend python -m pytest
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000

# Kill conflicting processes
sudo kill -9 $(lsof -t -i:3000)
```

#### Docker Build Failures
```bash
# Clean build
docker-compose down --volumes --remove-orphans
docker system prune -a
docker-compose -f docker-compose.full.yml build --no-cache
```

#### Database Connection Issues
```bash
# Reset database
docker-compose down database
docker volume rm interactive-coding-assistant_postgres_data
docker-compose up database
```

#### Memory Issues
```bash
# Increase Docker memory limit to 8GB+
# Check container resource usage
docker stats
```

#### VNC Connection Problems
```bash
# Check VNC service status
docker-compose exec sandbox ps aux | grep vnc

# Restart VNC service
docker-compose restart sandbox
```

### Log Analysis
```bash
# All service logs
docker-compose logs > deployment-logs.txt

# Specific service logs
docker-compose logs backend > backend-logs.txt
docker-compose logs web-app > frontend-logs.txt
```

## 🔐 Security Considerations

### Production Security Checklist
- [ ] Change all default passwords
- [ ] Use strong API keys and secrets
- [ ] Enable SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up proper backup strategies
- [ ] Enable audit logging
- [ ] Regular security updates

### Network Security
```bash
# Firewall configuration (UFW example)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp  # External access
sudo ufw deny 8000/tcp  # External access
sudo ufw deny 5432/tcp  # External access
sudo ufw deny 6379/tcp  # External access
```

## 📊 Performance Optimization

### Resource Allocation
```yaml
# docker-compose.full.yml resource limits
services:
  web-app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2.0'
  sandbox:
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
```

### Database Optimization
- Connection pooling enabled
- Query optimization with proper indexing
- Regular VACUUM and ANALYZE operations
- Backup strategy implementation

## 🔄 Maintenance Operations

### Regular Maintenance Tasks
```bash
# Weekly: Update base images
docker-compose pull
docker-compose up -d

# Monthly: Clean unused images and volumes
docker system prune -a
docker volume prune

# Database backup
docker-compose exec database pg_dump -U agent_user agent_db > backup.sql
```

### Backup and Recovery
```bash
# Database backup
docker-compose exec database pg_dump -U agent_user agent_db > backup_$(date +%Y%m%d).sql

# Redis backup
docker-compose exec redis redis-cli BGSAVE

# Restore from backup
docker-compose exec -T database psql -U agent_user agent_db < backup_20241219.sql
```

## 📞 Support and Resources

### Documentation Links
- [E2B Desktop SDK Documentation](https://e2b.dev/docs)
- [Ant Design X Documentation](https://ant.design/docs/react/introduce)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)

### Community and Support
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions for tips and best practices
- **Documentation**: Contribute to project documentation improvements

### Performance Benchmarks
- **Startup Time**: ~2-3 minutes for full stack
- **Memory Usage**: ~4-6GB for all services
- **Response Time**: <100ms for API calls
- **Desktop Latency**: <50ms for VNC streaming

## 🎉 Success Validation

After successful deployment, verify:

1. **Frontend Access**: http://localhost:3000 loads without errors
2. **Backend Health**: http://localhost:8000/health returns healthy status
3. **Database Connection**: PostgreSQL and Redis services running
4. **VNC Access**: http://localhost:6080 shows desktop interface
5. **API Documentation**: http://localhost:8000/docs is accessible
6. **WebSocket Connection**: Real-time chat functionality works

Your ADX-Agent Interactive Coding Assistant is now fully operational and ready for development or production use! 🚀

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Compatibility**: Docker 20.10+, Docker Compose v2+