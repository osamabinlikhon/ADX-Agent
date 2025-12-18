# Mermaid Diagrams in ADX-Agent Documentation

## 🎯 Overview

Mermaid diagrams are a powerful way to visualize complex system architectures, data flows, and processes directly in Markdown files. ADX-Agent uses Mermaid for comprehensive documentation.

## 📚 Quick Start

### Basic Syntax
```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
```

### Rendering in Different Platforms
- **GitHub**: Automatic rendering in .md files
- **GitLab**: Supported in wiki and markdown
- **VS Code**: Install "Mermaid Preview" extension
- **Documentation Sites**: Include Mermaid.js library

## 🔄 ADX-Agent Core Workflows

### 1. User Session Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant AI
    participant Desktop

    User->>Frontend: Open Application
    Frontend->>Backend: Initialize Session
    Backend->>Database: Create Session Record
    Database-->>Backend: Session ID
    
    User->>Frontend: Send Message
    Frontend->>Backend: POST /api/chat
    Backend->>AI: Process with Gemini
    AI->>AI: Analyze + Plan Actions
    AI-->>Backend: Response + Tool Calls
    
    alt Desktop Actions Required
        Backend->>Desktop: Execute Tool Calls
        Desktop-->>Backend: Action Results
    end
    
    Backend->>Database: Store Chat History
    Backend-->>Frontend: Response Data
    Frontend-->>User: Display Results
```

### 2. Real-time VNC Streaming

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant VNCViewer
    participant VNCServer
    participant E2B
    participant Desktop

    User->>Browser: Access Desktop Viewer
    Browser->>VNCViewer: Initialize Connection
    
    loop Continuous Streaming
        Desktop->>Desktop: GUI Updates
        E2B->>VNCServer: Screen Capture
        VNCServer->>VNCViewer: Encoded Stream
        VNCViewer->>Browser: WebSocket Update
        Browser->>User: Real-time Display
    end
    
    User->>Browser: Mouse Click
    Browser->>VNCViewer: Input Event
    VNCViewer->>VNCServer: VNC Protocol
    VNCServer->>E2B: Desktop Input
    E2B->>Desktop: Process Interaction
```

### 3. AI Agent Reasoning Flow

```mermaid
flowchart TD
    A[User Query] --> B[Parse Request]
    B --> C[Screenshot Analysis]
    C --> D[Visual Understanding]
    D --> E{Requires Action?}
    
    E -->|Yes| F[Generate Plan]
    F --> G[Execute Tools]
    G --> H[Monitor Results]
    H --> I{Success?}
    I -->|Yes| J[Update State]
    I -->|No| K[Adjust Plan]
    K --> F
    
    E -->|No| L[Generate Response]
    J --> M[Final Response]
    L --> M
    
    M --> N[Store History]
```

### 4. API Architecture

```mermaid
graph LR
    A[Client] --> B[Next.js Frontend]
    B --> C[FastAPI Backend]
    C --> D[API Routes]
    C --> E[WebSocket Handler]
    
    D --> F[Gemini AI]
    D --> G[E2B Desktop]
    D --> H[PostgreSQL]
    D --> I[Redis Cache]
    
    E --> J[Real-time Updates]
    J --> B
    
    subgraph "External APIs"
        K[Google Gemini]
        L[E2B Desktop SDK]
    end
    
    F --> K
    G --> L
```

### 5. Database Schema

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

### 6. Docker Deployment

```mermaid
graph TD
    A[Developer Push] --> B[GitHub Actions]
    B --> C[Run Tests]
    C --> D[Build Images]
    D --> E[Push to Registry]
    
    E --> F[Production Deploy]
    F --> G[Docker Compose]
    G --> H[Start Services]
    
    H --> I[Health Checks]
    I --> J{Healthy?}
    J -->|Yes| K[Service Ready]
    J -->|No| L[Rollback]
    L --> M[Alert Team]
    
    K --> N[Monitor Services]
```

### 7. Error Handling

```mermaid
flowchart TD
    A[API Request] --> B{Valid Request?}
    B -->|No| C[Return 400 Error]
    B -->|Yes| D{Service Available?}
    
    D -->|No| E[Return 503 Error]
    D -->|Yes| F[Process Request]
    
    F --> G{Execution Success?}
    G -->|Yes| H[Return Success]
    G -->|No| I[Log Error]
    
    I --> J{Retry Possible?}
    J -->|Yes| K[Retry Request]
    J -->|No| L[Return 500 Error]
    
    K --> F
    H --> M[Update Cache]
    M --> N[Store Analytics]
```

## 🎨 Diagram Types Used in ADX-Agent

### 1. Sequence Diagrams
```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🌐 Frontend
    participant Backend as ⚡ Backend
    participant AI as 🤖 AI Agent
    
    User->>Frontend: "Take screenshot"
    Frontend->>Backend: Process request
    Backend->>AI: Analyze + Respond
    AI-->>Backend: "Screenshot captured"
    Backend-->>Frontend: Response data
    Frontend-->>User: Display result
```

### 2. Flowcharts
```mermaid
flowchart TD
    A[🎯 User Input] --> B{🔍 Analyze}
    B --> C[🖼️ Take Screenshot]
    C --> D[🧠 AI Processing]
    D --> E{💡 Action Required?}
    
    E -->|Yes| F[🔧 Execute Tools]
    E -->|No| G[💬 Generate Response]
    
    F --> H[✅ Monitor Results]
    H --> I{🎯 Success?}
    I -->|Yes| J[📊 Update State]
    I -->|No| K[🔄 Retry/Adjust]
    
    J --> G
    K --> F
    
    G --> L[💾 Store History]
    L --> M[📤 Send Response]
```

### 3. System Architecture
```mermaid
graph TB
    subgraph "🌐 Frontend Layer"
        A[React 19 + Next.js 14]
        B[Ant Design X UI]
        C[TypeScript + Tailwind]
    end
    
    subgraph "⚡ Backend Layer"
        D[FastAPI Python]
        E[WebSocket Handler]
        F[API Routes]
    end
    
    subgraph "🧠 AI Services"
        G[Google Gemini 3]
        H[E2B Desktop SDK]
    end
    
    subgraph "💾 Data Layer"
        I[PostgreSQL 15]
        J[Redis Cache]
    end
    
    subgraph "🖥️ Desktop Environment"
        K[E2B Sandbox]
        L[VNC Server]
        M[Ubuntu + XFCE]
    end
    
    A --> D
    B --> A
    C --> A
    D --> E
    D --> F
    F --> G
    F --> H
    D --> I
    D --> J
    H --> K
    K --> L
    L --> M
```

### 4. Component Relationships
```mermaid
graph LR
    subgraph "User Interface"
        A[Chat Interface]
        B[Desktop Viewer]
        C[Status Dashboard]
    end
    
    subgraph "Core Services"
        D[AI Agent]
        E[Desktop Automation]
        F[Real-time Streaming]
    end
    
    subgraph "Data Services"
        G[Session Manager]
        H[Message Store]
        I[Action Logger]
    end
    
    A --> D
    B --> F
    C --> G
    
    D --> E
    D --> H
    G --> I
```

## 🛠️ Advanced Mermaid Features

### 1. Styling
```mermaid
graph TD
    A[🔵 Start] --> B[🟢 Process]
    B --> C[🟡 Decision]
    C --> D[🔴 End]
    
    classDef startEnd fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef process fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class A,D startEnd
    class B process
    class C decision
```

### 2. Interactive Elements
```mermaid
graph TD
    A[Main Service] --> B{Choose Path}
    B -->|Path 1| C[Frontend Service]
    B -->|Path 2| D[Backend Service]
    B -->|Path 3| E[AI Service]
    
    click C "/frontend/overview" "Frontend Docs"
    click D "/backend/api" "Backend API"
    click E "/ai/features" "AI Features"
```

### 3. Timeline
```mermaid
timeline
    title ADX-Agent Development Timeline
    
    2025-12-01 : Project Initiation
               : Architecture Design
               : Team Setup
    
    2025-12-05 : Frontend Development
               : React 19 + Next.js
               : Ant Design X Integration
    
    2025-12-10 : Backend Development
               : FastAPI Setup
               : Database Schema
               : API Endpoints
    
    2025-12-15 : AI Integration
               : Gemini 3 Setup
               : E2B Desktop SDK
               : Tool Calling
    
    2025-12-19 : Production Release
               : CI/CD Pipeline
               : Documentation
               : GitHub Repository
```

## 📋 Usage Guidelines

### 1. In Documentation Files
```markdown
# User Guide

## System Overview
The ADX-Agent follows this workflow:

```mermaid
sequenceDiagram
    participant User
    participant System
    User->>System: Request Action
    System->>System: Process
    System-->>User: Return Result
```
```

### 2. In API Documentation
```markdown
## API Flow

```mermaid
flowchart TD
    A[Client Request] --> B[Authentication]
    B --> C[Route Processing]
    C --> D[Business Logic]
    D --> E[Data Access]
    E --> F[Response]
```
```

### 3. In Architecture Documents
```markdown
## High-Level Architecture

```mermaid
graph TB
    subgraph "Layers"
        A[Presentation]
        B[Application]
        C[Data]
    end
    
    A --> B
    B --> C
```

### 4. Inline Diagrams
```mermaid
graph LR
    A[Input] --> B[Process] --> C[Output]
```

## 🔧 Tools and Extensions

### VS Code Extensions
- **Mermaid Preview**: Live preview of diagrams
- **Markdown All in One**: Enhanced markdown editing
- **Markdown Preview Enhanced**: Advanced preview features

### Online Editors
- **Mermaid Live Editor**: https://mermaid.live/
- **GitHub**: Automatic rendering
- **GitLab**: Built-in support

### CLI Tools
```bash
# Generate SVG from Mermaid
npm install -g @mermaid-js/mermaid-cli
mmdc -i input.mmd -o output.svg

# Convert to PNG
mmdc -i input.mmd -o output.png
```

## 📊 Performance Monitoring Diagrams

### System Metrics Flow
```mermaid
sequenceDiagram
    participant App
    participant Metrics
    participant Prometheus
    participant Grafana
    participant Alert
    
    loop Every 15s
        App->>Metrics: Collect Metrics
        Metrics->>Prometheus: Push Data
        Prometheus->>Grafana: Query
        Grafana->>Grafana: Update Dashboard
        
        Prometheus->>Alert: Check Thresholds
        alt Alert Condition
            Alert->>Team: Send Notification
        end
    end
```

## 🎯 Best Practices

### 1. Keep Diagrams Simple
- Use clear, descriptive labels
- Avoid overcrowding with too many elements
- Use consistent color schemes

### 2. Use Appropriate Diagram Types
- **Sequence**: For time-based interactions
- **Flowchart**: For decision processes
- **Graph**: For system architecture
- **ER**: For database relationships

### 3. Document Purpose
- Always include a title
- Add context in surrounding text
- Reference diagrams in your documentation

### 4. Testing
- Preview diagrams before committing
- Test rendering on target platform
- Ensure accessibility compliance

---

## 🎊 Conclusion

Mermaid diagrams provide a powerful way to visualize complex systems in your ADX-Agent documentation. They enhance understanding, improve communication, and serve as living documentation that stays synchronized with your codebase.

**For ADX-Agent specifically:**
- Use sequence diagrams for user interactions
- Use flowcharts for AI decision processes  
- Use architecture diagrams for system design
- Use ER diagrams for database design

---

**Documentation Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Author**: MiniMax Agent