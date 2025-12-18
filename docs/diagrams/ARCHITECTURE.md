# ADX-Agent System Architecture & Sequence Diagrams

## Table of Contents
1. [System Overview](#system-overview)
2. [AI Agent Interaction Flow](#ai-agent-interaction-flow)
3. [Real-time VNC Streaming](#real-time-vnc-streaming)
4. [API Request/Response Flow](#api-requestresponse-flow)
5. [WebSocket Communication](#websocket-communication)
6. [Docker Deployment Workflow](#docker-deployment-workflow)
7. [Database Schema](#database-schema)

## System Overview

### Overall Architecture Sequence

```mermaid
sequenceDiagram
    participant User
    participant Frontend as React Frontend
    participant Backend as FastAPI Backend
    participant AI as Gemini AI
    participant E2B as E2B Desktop
    participant VNC as VNC Server
    participant Database as PostgreSQL
    participant Redis as Redis Cache

    User->>Frontend: Access Application (http://localhost:3000)
    Frontend->>Backend: Initialize Session (WebSocket)
    Backend->>Database: Create Session Record
    Backend->>Redis: Cache Session Data
    
    User->>Frontend: Send Chat Message
    Frontend->>Backend: POST /api/chat
    Backend->>AI: Process with Gemini 3
    AI-->>Backend: AI Response + Tool Calls
    Backend->>E2B: Execute Desktop Actions
    E2B-->>Backend: Action Results
    
    Backend->>VNC: Capture Desktop Screenshot
    VNC-->>Backend: Screenshot Data
    Backend->>Frontend: WebSocket Update
    
    Frontend-->>User: Display AI Response + Screenshot
    Backend->>Database: Store Chat History
    Backend->>Redis: Update Cache
```

## AI Agent Interaction Flow

### Chat Processing Sequence

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant AI as Gemini AI
    participant Vision as Vision Analysis
    participant Desktop as E2B Desktop
    participant Tools as Tool Executor

    User->>Frontend: "Take screenshot and analyze"
    Frontend->>Backend: POST /api/ai-agent
    Backend->>Vision: Capture Desktop Screenshot
    Vision-->>Backend: Screenshot Image Data
    
    Backend->>AI: Send Screenshot + User Query
    AI->>AI: Multimodal Analysis
    AI-->>Backend: Structured Response
    
    alt Desktop Automation Required
        Backend->>Desktop: Execute Tool Call
        Desktop->>Tools: Perform Action
        Tools-->>Desktop: Action Result
        Desktop-->>Backend: Execution Result
    end
    
    Backend->>Vision: Capture Updated Screenshot
    Vision-->>Backend: Updated Image
    
    Backend-->>Frontend: Streaming Response
    Frontend-->>User: Display AI Response + Results
```

## Real-time VNC Streaming

### VNC Stream Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant VNCViewer as VNC Viewer
    participant VNCServer as VNC Server
    participant E2B as E2B Environment
    participant X11 as X11 Display
    participant Apps as Desktop Apps

    User->>Frontend: Access Desktop Viewer
    Frontend->>VNCViewer: Initialize WebSocket
    VNCViewer->>VNCServer: Connect (Port 6080)
    VNCServer->>E2B: Request VNC Stream
    E2B->>X11: Start Virtual Display
    
    loop Continuous Stream
        Apps->>X11: GUI Updates
        X11->>VNCServer: Screen Changes
        VNCServer->>VNCViewer: Encoded Stream
        VNCViewer->>Frontend: WebSocket Update
        Frontend->>User: Real-time Display
    end
    
    User->>Frontend: Mouse Click
    Frontend->>VNCViewer: Mouse Event
    VNCViewer->>VNCServer: VNC Protocol
    VNCServer->>E2B: Desktop Input
    E2B->>X11: Simulate Click
    X11->>Apps: App Responds
```

## API Request/Response Flow

### REST API Communication

```mermaid
sequenceDiagram
    participant Client as API Client
    participant Frontend as React Frontend
    participant Backend as FastAPI
    participant API as API Endpoints
    participant Database as PostgreSQL
    participant Cache as Redis
    participant External as External APIs

    Client->>Frontend: HTTP Request
    
    Note over Frontend: Authentication Check
    Frontend->>Frontend: Validate Token
    
    Frontend->>Backend: Proxy Request
    Backend->>API: Route Request
    
    alt Database Query Required
        API->>Cache: Check Redis Cache
        alt Cache Hit
            Cache-->>API: Cached Data
        else Cache Miss
            API->>Database: SQL Query
            Database-->>API: Database Result
            API->>Cache: Store Result
        end
    end
    
    alt External API Call
        API->>External: External Service Call
        External-->>API: Response Data
    end
    
    API->>Backend: Process Response
    Backend->>Frontend: JSON Response
    Frontend-->>Client: Formatted Data
```

## WebSocket Communication

### Real-time Updates Flow

```mermaid
sequenceDiagram
    participant Browser as Browser Client
    participant Frontend as React Frontend
    participant WS as WebSocket Handler
    participant Backend as FastAPI WS
    participant Agent as AI Agent
    participant Desktop as E2B Desktop

    Browser->>Frontend: Open Connection
    Frontend->>WS: Initialize WebSocket
    WS->>Backend: WebSocket Upgrade
    
    loop Live Updates
        Agent->>Agent: Process User Input
        Agent->>Desktop: Execute Action
        Desktop-->>Agent: Action Result
        
        Agent->>Backend: Broadcast Update
        Backend->>WS: Push to WebSocket
        WS->>Frontend: Send Update
        Frontend->>Browser: Update UI
        
        Browser->>Frontend: User Interaction
        Frontend->>WS: Send to Agent
        WS->>Agent: Process Interaction
    end
    
    Browser->>Frontend: Close Connection
    Frontend->>WS: Cleanup
    WS->>Backend: Disconnect
```

## Docker Deployment Workflow

### Container Orchestration

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GitHub as GitHub Actions
    participant Registry as Container Registry
    participant Server as Production Server
    participant Compose as Docker Compose
    participant Services as All Services

    Dev->>GitHub: Push Code
    GitHub->>GitHub: Run Tests
    
    par Build All Services
        GitHub->>Registry: Build Frontend
        GitHub->>Registry: Build Backend
        GitHub->>Registry: Build Desktop
    and
        GitHub->>GitHub: Run Security Scan
    end
    
    GitHub->>Registry: Push Images
    GitHub->>Dev: Build Complete
    
    Dev->>Server: Deploy
    Server->>Compose: Start Services
    
    loop Health Check
        Compose->>Services: Start Containers
        Services->>Services: Initialize
        Services->>Compose: Ready Status
    end
    
    Compose-->>Server: All Services Running
    Server-->>Dev: Deployment Complete
```

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    AGENT_SESSIONS {
        uuid id PK
        string session_id UK
        string user_id
        string status
        datetime created_at
        datetime updated_at
        jsonb metadata
    }
    
    CHAT_MESSAGES {
        uuid id PK
        uuid session_id FK
        string message_type
        text content
        datetime timestamp
        jsonb metadata
    }
    
    AGENT_ACTIONS {
        uuid id PK
        uuid session_id FK
        string action_type
        jsonb action_data
        string status
        datetime created_at
        datetime completed_at
        text error_message
    }
    
    SYSTEM_LOGS {
        uuid id PK
        uuid session_id FK
        string level
        string component
        text message
        jsonb metadata
        datetime timestamp
    }
    
    AGENT_SESSIONS ||--o{ CHAT_MESSAGES : has
    AGENT_SESSIONS ||--o{ AGENT_ACTIONS : performs
    AGENT_SESSIONS ||--o{ SYSTEM_LOGS : generates
```

## Component Architecture

### System Components Flow

```mermaid
graph TD
    A[User Browser] --> B[React Frontend]
    B --> C[Next.js API Routes]
    B --> D[WebSocket Connection]
    
    C --> E[FastAPI Backend]
    D --> E
    
    E --> F[Gemini AI Service]
    E --> G[E2B Desktop SDK]
    E --> H[PostgreSQL Database]
    E --> I[Redis Cache]
    
    G --> J[VNC Server]
    J --> K[E2B Environment]
    K --> L[Desktop Applications]
    
    E --> M[External APIs]
    
    subgraph "Monitoring"
        N[Grafana]
        O[Prometheus]
        P[Health Checks]
    end
    
    E --> N
    E --> O
    E --> P
```

## Performance Monitoring

### Metrics Collection Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant Metrics as Metrics Collector
    participant Prometheus as Prometheus
    participant Grafana as Grafana
    participant Alert as Alert Manager

    loop Every 15 seconds
        App->>Metrics: Collect Metrics
        Metrics->>Prometheus: Push Data
        
        Prometheus->>Grafana: Query Data
        Grafana->>Grafana: Update Dashboard
        
        Prometheus->>Alert: Check Thresholds
        alt Threshold Exceeded
            Alert->>Alert: Generate Alert
            Alert->>DevOps: Send Notification
        end
    end
```

## Error Handling Flow

### Exception Management

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Backend
    participant ErrorHandler as Error Handler
    participant Logger as System Logger
    participant Monitoring as Monitoring

    Client->>Frontend: API Request
    Frontend->>Backend: Forward Request
    
    alt Successful Response
        Backend-->>Frontend: Success Response
        Frontend-->>Client: Display Result
    else Error Occurs
        Backend->>ErrorHandler: Catch Exception
        ErrorHandler->>Logger: Log Error
        ErrorHandler->>Monitoring: Report Error
        
        ErrorHandler-->>Backend: Error Response
        Backend-->>Frontend: Error Details
        Frontend-->>Client: Error Message
        
        Logger->>Database: Store Error Log
        Monitoring->>AlertManager: Send Alert
    end
```

## Security Flow

### Authentication & Authorization

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Auth as Auth Service
    participant Backend
    participant Database
    participant Redis

    User->>Frontend: Login Request
    Frontend->>Auth: Validate Credentials
    Auth->>Database: Check User
    Database-->>Auth: User Data
    Auth->>Redis: Store Session
    Auth-->>Frontend: JWT Token
    
    User->>Frontend: Protected Request
    Frontend->>Backend: Request + Token
    
    Backend->>Auth: Validate Token
    Auth->>Redis: Check Session
    Redis-->>Auth: Session Data
    
    alt Valid Session
        Auth-->>Backend: Authorized
        Backend->>Database: Process Request
        Database-->>Backend: Data
        Backend-->>Frontend: Response
        Frontend-->>User: Protected Data
    else Invalid Session
        Auth-->>Backend: Unauthorized
        Backend-->>Frontend: 401 Error
        Frontend-->>User: Login Required
    end
```

---

## Usage Instructions

### Rendering Mermaid Diagrams

To render these Mermaid diagrams in your documentation:

1. **GitHub/GitLab**: Mermaid diagrams are automatically rendered in markdown files
2. **VS Code**: Install the "Mermaid Preview" extension
3. **Documentation Sites**: Use Mermaid CLI or integration plugins
4. **Websites**: Include Mermaid.js library

### Example Usage in Markdown

```markdown
```mermaid
sequenceDiagram
    participant A
    participant B
    A->>B: Hello World
    B-->>A: Response
```
```

### Interactive Features

- **Zoom**: Mouse wheel to zoom in/out
- **Pan**: Click and drag to move around
- **Download**: Right-click to save as SVG/PNG
- **Edit**: Click on nodes to edit in Mermaid live editor

---

**Documentation Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Author**: MiniMax Agent