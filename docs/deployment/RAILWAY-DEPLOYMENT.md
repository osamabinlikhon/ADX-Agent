# ADX-Agent Advanced Deployment Guide

## 🚀 Railway Deployment Strategy for ADX-Agent

Based on the Railway documentation, here's how to deploy the ADX-Agent project using Railway's advanced features.

## ⚡ Config-as-Code (NEW FEATURE)

ADX-Agent now supports Railway's Config-as-Code feature for declarative deployment configuration. This allows you to manage your entire deployment setup through version-controlled configuration files.

### 📁 Configuration Files Structure

```mermaid
graph TD
    A[ADX-Agent Project] --> B[railway.toml]
    A --> C[Frontend Config]
    A --> D[Backend Config]
    A --> E[Desktop Config]
    
    C --> F[frontend/railway.toml]
    D --> G[backend/railway.toml]
    E --> H[desktop/railway.toml]
    
    subgraph "Config Benefits"
        I[Version Control]
        J[Team Collaboration]
        K[Environment Consistency]
        L[Automated Deployment]
    end
```

### 🎯 Key Features

✅ **Declarative Configuration** - All deployment settings in version control  
✅ **Multi-Service Support** - Separate configs for each service  
✅ **Environment Variables** - Secure secret management  
✅ **Health Checks** - Automated service validation  
✅ **Scaling Configuration** - Auto-scaling and replica settings  
✅ **Pre-deploy Commands** - Database migrations and setup tasks  
✅ **Cache Optimization** - Build performance improvements  

### 📋 Project Configuration

#### 1. Project Structure for Railway

```mermaid
graph TD
    A[ADX-Agent Project] --> B[Frontend Service]
    A --> C[Backend Service]
    A --> D[Database Service]
    A --> E[Desktop Service]
    
    B --> F[Next.js 14]
    C --> G[FastAPI]
    D --> H[PostgreSQL + Redis]
    E --> I[E2B Desktop]
    
    subgraph "Railway Features"
        J[Private Networking]
        K[Custom Domains]
        L[Environment Management]
        M[Observability]
        N[CLI Deployment]
        O[Config-as-Code]
        P[Cache Mounts]
        Q[Pre-deploy Commands]
    end
```

#### 2. Railway Configuration Files

The ADX-Agent project includes optimized `railway.toml` files for each service:

**Root Configuration** (`railway.toml`)
```toml
[build]
builder = "nixpacks"

[deploy]
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

# Regional deployment configuration
[deploy.regions]
preferred = "us-west-2"
fallback = "us-east-1"

# Auto-scaling configuration
[deploy.scaling]
vertical = true
horizontal = {
    min = 1,
    max = 5,
    targetCpu = 70,
    targetMemory = 80
}

# Security configuration
[deploy.security]
sslMode = "strict"
wafEnabled = true
ddosProtection = true

# Monitoring configuration
[deploy.monitoring]
metricsEnabled = true
logRetention = "30d"
alertsEnabled = true
```

**Frontend Configuration** (`frontend/railway.toml`)
```toml
[build]
builder = "nixpacks"
buildCommand = "npm ci && npm run build"
watchPatterns = [
    "src/**",
    "public/**",
    "app/**",
    "components/**",
    "lib/**"
]

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

# Environment-specific configurations
[deploy.environments.production]
variables = [
    "NODE_ENV=production",
    "NEXT_PUBLIC_API_URL=https://api.adx-agent.railway.app"
]

[deploy.environments.staging]
variables = [
    "NODE_ENV=staging",
    "NEXT_PUBLIC_API_URL=https://staging-api.adx-agent.railway.app"
]
```

**Backend Configuration** (`backend/railway.toml`)
```toml
[build]
builder = "nixpacks"
buildCommand = "pip install -r requirements.txt"
watchPatterns = [
    "app/**",
    "*.py",
    "requirements.txt"
]

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5
preDeployCommand = ["python -m alembic upgrade head"]

# Cache mount for pip dependencies
[build.cache]
mounts = [
    {
        type = "cache",
        id = "s/backend-pip-cache",
        target = "/root/.cache/pip"
    }
]

# Environment-specific configurations
[deploy.environments.production]
variables = [
    "DATABASE_URL=${DATABASE_URL}",
    "REDIS_URL=${REDIS_URL}",
    "PYTHONPATH=/app"
]
```

**Desktop Configuration** (`desktop/railway.toml`)
```toml
[build]
builder = "nixpacks"
buildCommand = "apt-get update && apt-get install -y xvfb x11vnc xterm && npm install"
watchPatterns = [
    "app/**",
    "config/**",
    "*.sh",
    "package.json"
]

[deploy]
startCommand = "./startup.sh"
healthcheckPath = "/health"
healthcheckTimeout = 120
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

# Pre-deploy command for desktop environment setup
preDeployCommand = [
    "chmod +x /app/startup.sh",
    "mkdir -p /app/logs /app/screenshots"
]

# Volume mounts for persistent data
[deploy.volumes]
mounts = [
    {
        target = "/app/logs",
        source = "logs"
    },
    {
        target = "/app/screenshots", 
        source = "screenshots"
    }
]
```

#### 3. Enhanced Deployment Script

The ADX-Agent project includes an enhanced deployment script (`scripts/railway-deploy-enhanced.sh`) with advanced features:

```bash
#!/bin/bash
# Enhanced deployment with Config-as-Code support
./scripts/railway-deploy-enhanced.sh
```

**New Features:**
- 🔍 **Config-as-Code Detection** - Automatically detects and validates railway.toml files
- 🔐 **Auto-Secret Generation** - Generates secure secrets if not provided
- 🏥 **Enhanced Health Checks** - Comprehensive service validation
- 🌐 **Custom Domain Support** - Automated subdomain configuration
- 📊 **Detailed Deployment Summary** - Complete deployment status reporting

## 🏗️ Service Architecture on Railway

### Frontend Service (Next.js)

```yaml
# Frontend Service Configuration
name: adx-agent-frontend
source: ./frontend
build:
  builder: NIXPACKS
  buildCommand: npm ci && npm run build
  watchPatterns:
    - "src/**"
    - "public/**"
deploy:
  startCommand: npm start
  healthcheckPath: /
  healthcheckTimeout: 300
  restartPolicyType: "ON_FAILURE"
  restartPolicyMaxRetries: 3
environments:
  - name: production
    branch: main
  - name: staging
    branch: develop
```

### Backend Service (FastAPI)

```yaml
# Backend Service Configuration
name: adx-agent-backend
source: ./backend
build:
  builder: NIXPACKS
  buildCommand: pip install -r requirements.txt
  watchPatterns:
    - "app/**"
    - "*.py"
deploy:
  startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
  healthcheckPath: /health
  healthcheckTimeout: 60
  restartPolicyType: "ON_FAILURE"
  restartPolicyMaxRetries: 5
  preDeployCommand: ["python -m alembic upgrade head"]
environments:
  - name: production
    branch: main
  - name: staging
    branch: develop
```

### Database Service (PostgreSQL + Redis)

```yaml
# Database Service Configuration
name: adx-agent-database
source: .
build:
  builder: DOCKERFILE
  dockerfilePath: ./database/Dockerfile
deploy:
  startCommand: postgres
  restartPolicyType: "ON_FAILURE"
  restartPolicyMaxRetries: 3
environments:
  - name: production
    branch: main
  - name: staging
    branch: develop
```

## 🌐 Networking Configuration

### Private Networking Setup

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant Desktop
    
    User->>Frontend: HTTP Request
    Frontend->>Backend: API Call (railway.internal)
    Backend->>Database: Query (railway.internal)
    Backend->>Desktop: Action (railway.internal)
    
    Backend-->>Frontend: Response
    Frontend-->>User: HTML Response
```

### Domain Configuration

```bash
# Custom Domains Setup
# Main Application
railway domain add adx-agent.yourdomain.com

# API Subdomain
railway domain add api.adx-agent.yourdomain.com

# Desktop Access
railway domain add desktop.adx-agent.yourdomain.com

# Monitoring
railway domain add monitoring.adx-agent.yourdomain.com
```

## 🔧 Environment Management

### Environment Variables

```bash
# Production Environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.adx-agent.yourdomain.com
DATABASE_URL=postgresql://user:pass@database.railway.internal:5432/adx_agent
REDIS_URL=redis://user:pass@database.railway.internal:6379
E2B_API_KEY=your_e2b_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Staging Environment
NODE_ENV=staging
NEXT_PUBLIC_API_URL=https://staging-api.adx-agent.yourdomain.com
DATABASE_URL=postgresql://user:pass@staging-database.railway.internal:5432/adx_agent_staging
```

### Branch Deployment Rules

```yaml
# Deployment Configuration
deployments:
  - environment: production
    branch: main
    autoDeploy: true
    
  - environment: staging
    branch: develop
    autoDeploy: true
    
  - environment: development
    branch: feature/*
    autoDeploy: false
```

## 📊 Observability & Monitoring

### Log Aggregation

```mermaid
sequenceDiagram
    participant Service
    participant Railway
    participant Dashboard
    participant AlertManager
    
    Service->>Railway: Console Output
    Railway->>Railway: Parse Logs
    Railway->>Dashboard: Centralized View
    Railway->>AlertManager: Trigger Alerts
    
    Dashboard->>User: Real-time Monitoring
    AlertManager->>Team: Notifications
```

### Health Check Implementation

```python
# backend/app/health.py
from fastapi import FastAPI
import httpx
import redis
import psycopg2

app = FastAPI()

@app.get("/health")
async def health_check():
    """Comprehensive health check for Railway"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    # Database health check
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        conn.close()
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Redis health check
    try:
        r = redis.from_url(os.getenv("REDIS_URL"))
        r.ping()
        health_status["services"]["redis"] = "healthy"
    except Exception as e:
        health_status["services"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # External API health checks
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("https://api.e2b.dev/health")
            health_status["services"]["e2b_api"] = "healthy"
        except Exception as e:
            health_status["services"]["e2b_api"] = f"unhealthy: {str(e)}"
    
    return health_status
```

## 🔄 CI/CD Integration with Railway

### GitHub Actions for Railway with Wait for CI

```yaml
# .github/workflows/railway-deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [ main, develop ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Install Railway CLI
      run: npm install -g @railway/cli
      
    - name: Deploy to Railway
      run: |
        railway up --service ${{ matrix.service }}
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        
    - name: Wait for deployment
      run: |
        sleep 30
        railway status --service ${{ matrix.service }}
        
    - name: Health check
      run: |
        curl -f https://${{ matrix.service }}.railway.app/health
```

### Railway CLI Automation

```bash
#!/bin/bash
# scripts/railway-deploy.sh

set -e

echo "🚀 Deploying ADX-Agent to Railway"

# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy each service
echo "📦 Deploying Frontend..."
railway up --service adx-agent-frontend

echo "⚡ Deploying Backend..."
railway up --service adx-agent-backend

echo "🗄️ Deploying Database..."
railway up --service adx-agent-database

echo "🖥️ Deploying Desktop Service..."
railway up --service adx-agent-desktop

echo "✅ Deployment complete!"
echo "🌐 Frontend: $(railway status --service adx-agent-frontend | grep URL)"
echo "⚡ API: $(railway status --service adx-agent-backend | grep URL)"
```

## 📈 Scaling & Performance

### Auto-scaling Configuration

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

# Auto-scaling settings
[deploy.scaling]
vertical = true
horizontal = {
    min = 1,
    max = 10,
    targetCpu = 70,
    targetMemory = 80
}
```

### Performance Monitoring

```python
# backend/app/monitoring.py
import time
import psutil
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# Metrics
REQUEST_COUNT = Counter('adx_agent_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('adx_agent_request_duration_seconds', 'Request latency')
ACTIVE_SESSIONS = Gauge('adx_agent_active_sessions', 'Active user sessions')
CPU_USAGE = Gauge('adx_agent_cpu_usage_percent', 'CPU usage percentage')
MEMORY_USAGE = Gauge('adx_agent_memory_usage_percent', 'Memory usage percentage')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path
    ).inc()
    
    REQUEST_LATENCY.observe(time.time() - start_time)
    
    return response

def collect_system_metrics():
    """Collect system metrics for Railway monitoring"""
    while True:
        CPU_USAGE.set(psutil.cpu_percent())
        MEMORY_USAGE.set(psutil.virtual_memory().percent)
        time.sleep(30)

# Start metrics server
if __name__ == "__main__":
    start_http_server(8001)
    collect_system_metrics()
```

## 🔐 Security Configuration

### Environment Security

```bash
# Security best practices for Railway
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set ENCRYPTION_KEY=$(openssl rand -base64 32)
railway variables set DATABASE_PASSWORD=$(openssl rand -base64 16)

# Enable Railway's built-in security features
railway security enable-ddos-protection
railway security enable-waf
railway security set-ssl-mode=strict
```

### Custom SSL Configuration

```nginx
# Custom nginx configuration for Railway
server {
    listen 443 ssl http2;
    server_name adx-agent.yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/adx-agent.crt;
    ssl_certificate_key /etc/ssl/private/adx-agent.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        proxy_pass http://adx-agent-frontend.railway.internal:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://adx-agent-backend.railway.internal:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚀 Deployment Commands

### Quick Deploy Script

```bash
#!/bin/bash
# deploy-to-railway.sh

echo "🚀 ADX-Agent Railway Deployment"
echo "================================"

# Check prerequisites
command -v railway >/dev/null 2>&1 || { echo "❌ Railway CLI not found. Install with: npm install -g @railway/cli"; exit 1; }

# Login
echo "🔐 Logging in to Railway..."
railway login

# Create project if it doesn't exist
if ! railway status >/dev/null 2>&1; then
    echo "📁 Creating Railway project..."
    railway init adx-agent
fi

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set NEXT_PUBLIC_API_URL=https://api.adx-agent.railway.app
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set REDIS_URL=$REDIS_URL

# Deploy services
echo "📦 Deploying services..."
railway up --service adx-agent-frontend
railway up --service adx-agent-backend
railway up --service adx-agent-database

# Configure domains
echo "🌐 Configuring custom domains..."
railway domain add adx-agent.yourdomain.com
railway domain add api.adx-agent.yourdomain.com

# Deploy complete
echo "✅ Deployment complete!"
railway status

echo ""
echo "🌐 Access your application:"
echo "   Frontend: https://adx-agent.yourdomain.com"
echo "   API: https://api.adx-agent.yourdomain.com"
echo "   Health: https://adx-agent.yourdomain.com/health"
```

## 📚 Railway CLI Reference

### Essential Commands

```bash
# Project management
railway init                    # Initialize new project
railway link                    # Link to existing project
railway status                  # Check project status

# Environment variables
railway variables               # List all variables
railway variables set KEY=VALUE # Set variable
railway variables unset KEY     # Remove variable

# Deployment
railway up                      # Deploy current directory
railway up --service SERVICE    # Deploy specific service
railway logs                    # View deployment logs
railway shell                   # Open shell in deployment

# Database management
railway add                     # Add database service
railway run COMMAND             # Run command in Railway environment

# Domains and networking
railway domain add DOMAIN       # Add custom domain
railway domain list             # List all domains
railway share                   # Share project temporarily

# Monitoring
railway metrics                 # View metrics
railway logs --follow           # Follow logs in real-time

# Config-as-Code
railway validate                # Validate railway.toml files
railway deploy --config FILE    # Deploy with specific config
```

## 🎯 Best Practices for ADX-Agent on Railway

### 1. Service Separation
- Keep frontend, backend, and database as separate services
- Use Railway's private networking for internal communication
- Implement proper health checks for each service

### 2. Environment Management
- Use Railway's environment management for different deployment stages
- Implement proper secrets management
- Use environment-specific configurations

### 3. Monitoring & Observability
- Implement comprehensive health checks
- Use Railway's built-in logging and metrics
- Set up alerts for critical issues

### 4. Security
- Use Railway's built-in security features
- Implement proper SSL/TLS configuration
- Use environment variables for sensitive data

### 5. Performance
- Monitor resource usage and scale accordingly
- Use Railway's auto-scaling features
- Implement caching strategies

### 6. Config-as-Code
- Version control all railway.toml files
- Use different configurations for different environments
- Validate configurations before deployment
- Document all configuration options

---

## 🎊 Conclusion

Railway provides an excellent platform for deploying the ADX-Agent project with its advanced features:

✅ **Zero-config deployment** with Nixpacks  
✅ **Config-as-Code** with railway.toml files  
✅ **Private networking** for secure service communication  
✅ **Custom domains** with SSL support  
✅ **Environment management** for different stages  
✅ **Built-in observability** with logs and metrics  
✅ **CLI automation** for CI/CD integration  
✅ **Auto-scaling** based on resource usage  
✅ **Database integration** with PostgreSQL and Redis  
✅ **Pre-deploy commands** for migrations and setup  
✅ **Cache mounts** for build performance  
✅ **Wait for CI** integration with GitHub Actions  

The combination of Railway's features with ADX-Agent's architecture creates a robust, scalable, and maintainable deployment solution.

---

**Deployment Guide Version**: 2.0.0  
**Last Updated**: 2025-12-19  
**Author**: MiniMax Agent