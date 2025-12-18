# 🚀 Deployment Guide - Interactive Coding Assistant

This guide covers deploying the Interactive Coding Assistant to production with real-time VNC streaming, AI integration, and desktop automation capabilities.

## 📋 Prerequisites

### Required Services
- **Google Gemini 3 API Key** - For AI reasoning and multimodal processing
- **E2B Desktop API Key** - For secure desktop automation and VNC streaming
- **Vercel/Netlify Account** - For frontend hosting
- **Redis (Optional)** - For session management in production

### Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd interactive-coding-assistant

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

## 🔧 Environment Configuration

### Required Environment Variables
```env
# AI API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# E2B Desktop SDK Configuration
E2B_API_KEY=your_e2b_api_key_here
E2B_DESKTOP_SANDBOX=browser-automation

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://yourdomain.com

# VNC Configuration
VNC_PORT=5901
VNC_QUALITY=high
VNC_COMPRESSION=auto

# Security Configuration
ALLOWED_ORIGINS=https://yourdomain.com
SESSION_SECRET=your_session_secret_here
```

### Optional Production Variables
```env
# Database Configuration (Optional)
DATABASE_URL=postgresql://user:pass@localhost:5432/agent_db

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Monitoring Configuration
SENTRY_DSN=your_sentry_dsn_here
ANALYTICS_ID=your_analytics_id_here

# CDN Configuration
CDN_URL=https://cdn.yourdomain.com
```

## 🌐 Deployment Options

### Option 1: Vercel Deployment (Recommended)

Vercel provides excellent support for Next.js applications with edge functions and real-time capabilities.

#### Steps:
1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure Vercel**
```bash
vercel login
vercel link
```

3. **Set Environment Variables**
```bash
# Set all required environment variables
vercel env add GEMINI_API_KEY production
vercel env add E2B_API_KEY production
# ... add all other required variables
```

4. **Deploy**
```bash
vercel --prod
```

#### Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "fra1"],
  "functions": {
    "src/app/api/chat/route.ts": {
      "maxDuration": 300,
      "memory": 1024
    },
    "src/app/api/health/route.ts": {
      "maxDuration": 30,
      "memory": 256
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### Option 2: Docker Deployment

For self-hosted or cloud deployment with more control.

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - E2B_API_KEY=${E2B_API_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

#### Build and Deploy
```bash
# Build the Docker image
docker build -t interactive-coding-assistant .

# Run with Docker Compose
docker-compose up -d

# Or run standalone
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e E2B_API_KEY=your_key \
  interactive-coding-assistant
```

### Option 3: AWS/GCP/Azure Deployment

#### AWS (ECS + ALB)
```yaml
# CloudFormation template snippet
Resources:
  TaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: interactive-coding-assistant
      NetworkMode: awsvpc
      RequiresCompatibilities: ["FARGATE"]
      Cpu: "512"
      Memory: "1024"
      ExecutionRoleArn: !Ref ExecutionRole
      ContainerDefinitions:
        - Name: app
          Image: your-ecr-repo/interactive-coding-assistant:latest
          PortMappings:
            - ContainerPort: 3000
            - Protocol: tcp
          Environment:
            - Name: NODE_ENV
              Value: production
            - Name: GEMINI_API_KEY
              Value: !Ref GeminiApiKey
            - Name: E2B_API_KEY
              Value: !Ref E2BApiKey
```

## 🔒 Security Configuration

### API Security
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // CORS configuration
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  )
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Rate Limiting
```typescript
// utils/rateLimiter.ts
import rateLimit from 'express-rate-limit'

export const chatRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
```

## 📊 Monitoring & Observability

### Health Checks
```typescript
// pages/api/health.ts
export default async function handler(req, res) {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    services: {
      gemini3: await checkGemini3(),
      e2bDesktop: await checkE2BDesktop(),
      vncStream: await checkVNCStream()
    }
  }
  
  res.status(200).json(health)
}
```

### Error Tracking (Sentry)
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring
```typescript
// lib/monitoring.ts
export class PerformanceMonitor {
  static trackAPICall(endpoint: string, duration: number, success: boolean) {
    // Send to analytics service
    analytics.track('api_call', {
      endpoint,
      duration,
      success,
      timestamp: Date.now()
    })
  }
  
  static trackUserAction(action: string, metadata: any) {
    analytics', {
      action.track('user_action,
      metadata,
      timestamp: Date.now()
    })
  }
}
```

## 🔧 Production Optimizations

### Database Optimization
```sql
-- Index for session queries
CREATE INDEX idx_sessions_active ON sessions(last_activity) WHERE status = 'active';

-- Index for message queries
CREATE INDEX idx_messages_session ON messages(session_id, created_at);
```

### Caching Strategy
```typescript
// lib/cache.ts
interface CacheConfig {
  ttl: number;
  maxSize: number;
}

export class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  
  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }
  
  get(key: string) {
    const item = this.cache.get(key);
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
}
```

### Connection Pooling
```typescript
// lib/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

## 📈 Scaling Considerations

### Load Balancing
```nginx
# nginx.conf
upstream app {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Horizontal Scaling
```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: interactive-coding-assistant
spec:
  replicas: 3
  selector:
    matchLabels:
      app: interactive-coding-assistant
  template:
    metadata:
      labels:
        app: interactive-coding-assistant
    spec:
      containers:
      - name: app
        image: your-registry/interactive-coding-assistant:latest
        ports:
        - containerPort: 3000
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: gemini-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: interactive-coding-assistant-service
spec:
  selector:
    app: interactive-coding-assistant
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 🚨 Troubleshooting

### Common Issues

#### 1. VNC Connection Failed
```bash
# Check E2B Desktop service status
curl -X GET "https://api.e2b.dev/v1/health"

# Verify VNC port is accessible
telnet your-domain.com 5901
```

#### 2. AI API Rate Limits
```typescript
// Implement exponential backoff
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

#### 3. Memory Leaks
```typescript
// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
  });
}, 60000);
```

## 📝 Post-Deployment Checklist

- [ ] All environment variables are set correctly
- [ ] SSL certificates are configured
- [ ] Health checks are passing
- [ ] Monitoring and alerting are configured
- [ ] Backup and recovery procedures are in place
- [ ] Load testing has been completed
- [ ] Security audit has been performed
- [ ] Documentation is updated
- [ ] Team has been trained on deployment process

## 🆘 Support

For deployment issues:
1. Check the application logs
2. Verify environment variables
3. Test API endpoints manually
4. Review monitoring dashboards
5. Contact support with specific error messages

This deployment guide ensures a robust, scalable, and secure production environment for the Interactive Coding Assistant with real-time VNC streaming and AI-powered desktop automation.
