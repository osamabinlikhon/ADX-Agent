# 🚀 Quick Start Guide - Interactive Coding Assistant

Get your AI-powered coding assistant with desktop automation up and running in minutes!

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini 3 API key
- E2B Desktop API key

## ⚡ Quick Setup (5 minutes)

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd interactive-coding-assistant

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Configure Environment
Edit `.env.local` with your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
E2B_API_KEY=your_e2b_api_key_here
NEXTAUTH_SECRET=your_random_secret_here
```

### 3. Start Development
```bash
# Start the development server
npm run dev

# Open http://localhost:3000
```

### 4. Test the System
1. **Initialize Desktop**: Type "Initialize desktop session"
2. **Take Screenshot**: Click "Take Screenshot" button
3. **Launch Application**: Try "Open terminal" or "Open browser"
4. **Start Coding**: Ask "Create a React component"

## 🎯 Core Features

### 🤖 AI-Powered Reasoning
- **Multimodal Processing**: See screenshots, analyze code, understand context
- **Function Calling**: Execute desktop actions, file operations, terminal commands
- **Real-time Streaming**: Live token streaming for immediate feedback

### 🖥️ Desktop Automation
- **Secure Sandboxing**: E2B Desktop provides isolated Linux environments
- **VNC Streaming**: Real-time desktop viewing with <100ms latency
- **Mouse/Keyboard Control**: Precise interaction with applications
- **File Operations**: Create, read, write, delete files programmatically

### 💬 Rich Interface
- **Ant Design X**: Enterprise-grade UI components
- **ThoughtChain**: Visual representation of AI reasoning
- **XMarkdown**: Streaming markdown rendering
- **Bubble Chat**: Real-time conversation interface

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   E2B Desktop   │
│  (React + ADX)  │◄──►│   (Next.js)     │◄──►│   (Sandbox)     │
│                 │    │                 │    │                 │
│ • Chat UI       │    │ • Gemini 3 AI   │    │ • VNC Streaming │
│ • VNC Viewer    │    │ • Tool Execution│    │ • File System   │
│ • ThoughtChain  │    │ • Session Mgmt  │    │ • Browser Auto  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎮 Usage Examples

### Basic Interactions
```bash
# Initialize and explore
"Initialize desktop session"
"Take a screenshot of the current desktop"
"Open the file manager and show me the current directory"
```

### Development Tasks
```bash
# Create new projects
"Create a new Next.js project with TypeScript and Tailwind"
"Set up a React component for a todo list"
"Open VS Code and create a Python script"

# Debug and fix issues
"Help me debug this error in my code"
"Review my React component for best practices"
"Analyze this screenshot and suggest improvements"
```

### Complex Workflows
```bash
# Multi-step automation
"Open browser, go to GitHub, search for React projects, and save the top 5 results"
"Create a new file, write a function, run tests, and show me the output"
"Take a screenshot, analyze the UI, and suggest improvements"
```

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:integration  # Run integration tests
npm run test:e2e     # Run end-to-end tests

# Quality Assurance
npm run lint         # Code linting
npm run format       # Code formatting
npm run audit        # Security audit
```

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js 14 app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── AgentWorkspace.tsx    # Main workspace
│   ├── ChatInterface.ts      # Chat UI
│   ├── DesktopViewer.ts      # VNC viewer
│   ├── ThoughtChain.ts       # AI reasoning display
│   ├── SystemControls.ts     # Control panel
│   └── SystemStatus.ts       # Health monitoring
├── hooks/              # Custom React hooks
│   └── useAgentSession.ts    # Session management
├── lib/                # Utilities and helpers
│   └── utils.ts              # Utility functions
└── types/              # TypeScript definitions
    └── agent.ts              # Agent types
```

## 🔍 Key Components

### AgentWorkspace
The main interface combining chat, VNC viewer, and AI reasoning visualization.

```tsx
import AgentWorkspace from '@/components/AgentWorkspace';

export default function Page() {
  return (
    <div className="h-screen">
      <AgentWorkspace />
    </div>
  );
}
```

### useAgentSession Hook
Manages the desktop automation session and chat state.

```tsx
const {
  session,
  vncUrl,
  messages,
  isLoading,
  connect,
  sendMessage,
  takeScreenshot
} = useAgentSession({
  autoConnect: true
});
```

### Chat Interface
Real-time chat with streaming responses and tool execution feedback.

```tsx
<ChatInterface
  messages={messages}
  isLoading={isLoading}
  onSendMessage={sendMessage}
  onToolCall={executeAction}
  session={session}
  isAutomationActive={true}
/>
```

## 🎯 Available Tools

### Vision Tools
- `take_screenshot` - Capture desktop state
- `analyze_image` - AI-powered image analysis

### Interaction Tools
- `mouse_action` - Click, drag, scroll
- `keyboard_action` - Type, press keys, key combinations
- `launch_application` - Start applications

### System Tools
- `file_operations` - Create, read, write, delete files
- `browser_automation` - Web browser control
- `terminal_operations` - Execute shell commands
- `get_session_info` - Session management

## 🔒 Security Features

- **Sandboxed Execution**: All automation runs in isolated E2B environments
- **Permission-Based Access**: Granular control over desktop capabilities
- **API Key Protection**: Server-side credential management
- **Input Sanitization**: XSS prevention and data validation
- **Rate Limiting**: API abuse prevention

## 📊 Monitoring

### System Health
- Real-time component status monitoring
- Performance metrics and latency tracking
- Error logging and alerting
- Resource usage monitoring

### Analytics
- User interaction tracking
- Tool usage statistics
- Performance benchmarking
- Success rate monitoring

## 🚀 Production Deployment

### Environment Setup
```bash
# Production build
npm run build
npm start

# With PM2
pm2 start npm --name "coding-assistant" -- start

# With Docker
docker build -t coding-assistant .
docker run -p 3000:3000 coding-assistant
```

### Environment Variables
```env
# Required
GEMINI_API_KEY=your_production_key
E2B_API_KEY=your_production_key
NEXTAUTH_SECRET=secure_random_string

# Optional
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SENTRY_DSN=your_sentry_dsn
```

## 🧪 Testing

### Unit Tests
```bash
npm run test                    # Run all tests
npm run test -- --watch         # Watch mode
npm run test -- --coverage      # Coverage report
```

### Integration Tests
```bash
npm run test:integration        # API integration tests
npm run test:e2e               # End-to-end tests
```

### Manual Testing
1. **Session Management**: Test connection/disconnection
2. **Tool Execution**: Verify all tools work correctly
3. **UI Responsiveness**: Test on different screen sizes
4. **Error Handling**: Test failure scenarios
5. **Performance**: Monitor response times and resource usage

## 🛠️ Troubleshooting

### Common Issues

#### Connection Failed
```bash
# Check API keys
echo $GEMINI_API_KEY
echo $E2B_API_KEY

# Test API connectivity
curl -H "Authorization: Bearer $E2B_API_KEY" https://api.e2b.dev/v1/health
```

#### VNC Stream Issues
```bash
# Check if VNC port is accessible
telnet localhost 5901

# Verify E2B Desktop status
curl https://api.e2b.dev/v1/sandboxes
```

#### Memory Issues
```bash
# Monitor memory usage
npm run dev -- --inspect

# Check for memory leaks
node --expose-gc --inspect node_modules/.bin/jest
```

## 📚 Next Steps

1. **Customize UI**: Modify themes and components in `src/components/`
2. **Add Tools**: Implement custom automation tools in API routes
3. **Extend AI**: Add domain-specific reasoning capabilities
4. **Scale Up**: Deploy to production with load balancing
5. **Monitor**: Set up comprehensive monitoring and alerting

## 🤝 Support

- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join community discussions
- **API Reference**: See `/docs/api.md` for complete API docs

---

**Ready to start building?** Run `npm run dev` and visit http://localhost:3000 to begin your AI-powered coding journey! 🚀
