#!/usr/bin/env python3
"""
Backend API Service for Interactive Coding Assistant
Provides AI-powered desktop automation and chat services
"""

import os
import logging
import asyncio
import json
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import uvicorn
from pydantic import BaseModel
import uuid
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ADX Agent Backend",
    description="AI-powered desktop automation backend with E2B Desktop SDK integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    content: str
    role: str = "user"
    session_id: str | None = None
    stream: bool = False

class SandboxConfig(BaseModel):
    environment: str = "ubuntu-desktop"
    display: str = "1920x1080"
    tools: List[str] = ["browser", "terminal", "code_editor"]
    memory: int = 4
    cpu: int = 2

class SandboxRequest(BaseModel):
    action: str  # create, destroy, status
    config: Optional[SandboxConfig] = None
    sandbox_id: Optional[str] = None

class ExecutionRequest(BaseModel):
    command: str
    timeout: int = 30
    sandbox_id: Optional[str] = None
    environment: Optional[Dict[str, str]] = None

class AIRequest(BaseModel):
    messages: List[Dict[str, str]]
    stream: bool = True
    session_id: Optional[str] = None

# In-memory storage (use Redis/DB in production)
chat_sessions: Dict[str, List[Dict[str, str]]] = {}
active_connections: List[WebSocket] = []
sandbox_sessions: Dict[str, Dict[str, Any]] = {}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ADX Agent Backend",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "uptime": "running",
        "api_keys_available": {
            "gemini": bool(os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")),
            "e2b": bool(os.getenv("E2B_API_KEY")),
            "huggingface": bool(os.getenv("HF_TOKEN"))
        },
        "active_sessions": len(chat_sessions),
        "active_connections": len(active_connections),
        "active_sandboxes": len(sandbox_sessions),
        "endpoints": {
            "sandbox": "/api/sandbox",
            "ai_agent": "/api/ai-agent", 
            "execute": "/api/execute",
            "chat": "/api/chat",
            "websocket": "/ws"
        }
    }

# New: Sandbox Management API
@app.post("/api/sandbox")
async def manage_sandbox(request: SandboxRequest):
    """Create, manage, or destroy E2B Desktop sandboxes"""
    try:
        e2b_api_key = os.getenv("E2B_API_KEY")
        
        if not e2b_api_key:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "E2B API key not configured",
                    "message": "E2B API key is required for sandbox management"
                }
            )
        
        if request.action == "create":
            # Generate sandbox ID
            sandbox_id = str(uuid.uuid4())
            
            # Create sandbox session
            sandbox_config = request.config or SandboxConfig()
            
            # In a real implementation, this would call E2B Desktop SDK
            # For demo purposes, we'll simulate the sandbox creation
            
            sandbox_session = {
                "id": sandbox_id,
                "status": "creating",
                "config": sandbox_config.dict(),
                "created_at": datetime.now().isoformat(),
                "vnc_url": f"vnc://localhost:5900/{sandbox_id}",
                "web_interface": f"http://localhost:6080/vnc.html?id={sandbox_id}",
                "endpoints": {
                    "execute": f"/api/execute?sandbox_id={sandbox_id}",
                    "status": f"/api/sandbox/status/{sandbox_id}"
                }
            }
            
            # Simulate sandbox startup delay
            await asyncio.sleep(2)
            sandbox_session["status"] = "running"
            
            sandbox_sessions[sandbox_id] = sandbox_session
            
            return {
                "status": "created",
                "sandbox": sandbox_session,
                "message": "E2B Desktop sandbox created successfully"
            }
            
        elif request.action == "destroy":
            if not request.sandbox_id or request.sandbox_id not in sandbox_sessions:
                raise HTTPException(status_code=404, detail="Sandbox not found")
            
            # Destroy sandbox
            del sandbox_sessions[request.sandbox_id]
            
            return {
                "status": "destroyed",
                "sandbox_id": request.sandbox_id,
                "message": "Sandbox destroyed successfully"
            }
            
        elif request.action == "status":
            if not request.sandbox_id or request.sandbox_id not in sandbox_sessions:
                raise HTTPException(status_code=404, detail="Sandbox not found")
            
            return {
                "status": "success",
                "sandbox": sandbox_sessions[request.sandbox_id]
            }
            
        else:
            raise HTTPException(status_code=400, detail="Invalid action. Use: create, destroy, or status")
            
    except Exception as e:
        logger.error(f"Error managing sandbox: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sandbox/status/{sandbox_id}")
async def get_sandbox_status(sandbox_id: str):
    """Get status of specific sandbox"""
    if sandbox_id not in sandbox_sessions:
        raise HTTPException(status_code=404, detail="Sandbox not found")
    
    return {
        "status": "success",
        "sandbox": sandbox_sessions[sandbox_id]
    }

# New: AI Agent Streaming API
@app.post("/api/ai-agent")
async def ai_agent_chat(request: AIRequest):
    """Stream AI responses with tool calling for desktop control"""
    try:
        gemini_api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
        e2b_api_key = os.getenv("E2B_API_KEY")
        
        session_id = request.session_id or str(uuid.uuid4())
        
        if request.stream:
            return StreamingResponse(
                ai_agent_stream(request, session_id, gemini_api_key, e2b_api_key),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                }
            )
        else:
            # Non-streaming response
            response = await process_ai_message(request.messages, gemini_api_key, e2b_api_key)
            return {
                "status": "success",
                "response": response,
                "session_id": session_id
            }
            
    except Exception as e:
        logger.error(f"Error in AI agent chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def ai_agent_stream(request: AIRequest, session_id: str, gemini_api_key: str, e2b_api_key: str):
    """Stream AI responses with tool calling"""
    try:
        # Process messages and generate responses
        messages = request.messages
        
        # Initialize conversation context
        context = f"Session: {session_id}\nAvailable sandboxes: {len(sandbox_sessions)}\n"
        
        # Generate AI response (in real implementation, use Gemini API)
        response_content = await generate_ai_response(messages, context, gemini_api_key, e2b_api_key)
        
        # Simulate streaming response
        response_data = {
            "type": "ai_response",
            "content": response_content,
            "role": "assistant",
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "tool_calls": [],  # Would include actual tool calls in real implementation
            "metadata": {
                "model": "gemini-3-pro",
                "stream": True,
                "tokens_used": len(response_content.split())
            }
        }
        
        # Stream the response
        yield f"data: {json.dumps(response_data)}\n\n"
        
        # Simulate additional tool calls or updates
        await asyncio.sleep(0.5)
        
        tool_call_data = {
            "type": "tool_call",
            "tool": "screenshot",
            "parameters": {"region": "full"},
            "result": "screenshot_captured",
            "timestamp": datetime.now().isoformat()
        }
        
        yield f"data: {json.dumps(tool_call_data)}\n\n"
        
        # Final completion signal
        completion_data = {
            "type": "completion",
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
        
        yield f"data: {json.dumps(completion_data)}\n\n"
        
    except Exception as e:
        error_data = {
            "type": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
        yield f"data: {json.dumps(error_data)}\n\n"

async def generate_ai_response(messages: List[Dict[str, str]], context: str, gemini_api_key: str, e2b_api_key: str) -> str:
    """Generate AI response using Gemini API (simulated for demo)"""
    
    # Check for API keys
    has_api_keys = bool(gemini_api_key and e2b_api_key)
    
    if not has_api_keys:
        return f"""🤖 **Demo Mode - AI Agent Response**

**Context**: {context}

**Your last message**: "{messages[-1]['content'] if messages else 'None'}"

**Available Capabilities**:
- 🖥️ Desktop automation via E2B Desktop SDK
- 🌐 Browser automation with Playwright
- 📁 File system operations
- 🖼️ Screenshot capture and analysis
- 🔧 System monitoring and control

**Demo Actions**:
To demonstrate capabilities, I would:
1. Capture current desktop screenshot
2. Analyze UI elements for interaction
3. Execute requested actions
4. Provide real-time feedback

**Full AI Features (with API keys)**:
- Real-time multimodal reasoning
- Precise GUI element detection
- Automated workflow execution
- Context-aware decision making

**Current Status**: Ready to assist with desktop automation tasks!

Try asking: "Open browser and navigate to GitHub" or "Create a new file in the editor"
"""
    else:
        # In real implementation, this would call Gemini API with tool calling
        return f"Processing your request with full AI capabilities. Session: {context}"

async def process_ai_message(messages: List[Dict[str, str]], gemini_api_key: str, e2b_api_key: str) -> Dict[str, Any]:
    """Process single AI message (non-streaming)"""
    return {
        "content": "AI response generated",
        "role": "assistant",
        "tool_calls": [],
        "metadata": {"model": "gemini-3-pro"}
    }

# New: Direct Execution API
@app.post("/api/execute")
async def execute_command(request: ExecutionRequest):
    """Direct execution endpoint for manual commands"""
    try:
        e2b_api_key = os.getenv("E2B_API_KEY")
        
        if not e2b_api_key:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "E2B API key not configured",
                    "message": "Command execution requires E2B API key"
                }
            )
        
        # Determine which sandbox to use
        sandbox_id = request.sandbox_id
        if sandbox_id and sandbox_id not in sandbox_sessions:
            raise HTTPException(status_code=404, detail="Sandbox not found")
        
        # Simulate command execution
        execution_id = str(uuid.uuid4())
        
        # In real implementation, this would:
        # 1. Connect to E2B Desktop session
        # 2. Execute command in sandbox environment
        # 3. Capture output and return results
        
        execution_result = {
            "execution_id": execution_id,
            "command": request.command,
            "status": "completed",
            "stdout": f"Demo: Executed '{request.command}' in sandbox",
            "stderr": "",
            "exit_code": 0,
            "execution_time": 0.1,
            "timestamp": datetime.now().isoformat(),
            "sandbox_id": sandbox_id or "default"
        }
        
        # Simulate execution delay
        await asyncio.sleep(0.1)
        
        return {
            "status": "success",
            "result": execution_result
        }
        
    except Exception as e:
        logger.error(f"Error executing command: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Existing chat endpoint (enhanced)
@app.post("/api/chat")
async def chat_endpoint(message: ChatMessage):
    """Enhanced chat endpoint with AI integration"""
    try:
        session_id = message.session_id or str(uuid.uuid4())
        
        # Store message in session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = []
        
        chat_sessions[session_id].append({
            "role": "user",
            "content": message.content,
            "timestamp": datetime.now().isoformat()
        })
        
        # Generate response using AI agent
        messages = chat_sessions[session_id][-10:]  # Last 10 messages for context
        
        # Process with AI
        response_content = await generate_ai_response(
            messages, 
            f"Session: {session_id}", 
            os.getenv("GOOGLE_GENERATIVE_AI_API_KEY"),
            os.getenv("E2B_API_KEY")
        )
        
        # Store assistant response
        chat_sessions[session_id].append({
            "role": "assistant",
            "content": response_content,
            "timestamp": datetime.now().isoformat()
        })
        
        response = {
            "content": response_content,
            "role": "assistant",
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }
        
        # Broadcast to WebSocket connections
        await broadcast_message({
            "type": "chat_response",
            "data": response
        })
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Enhanced WebSocket endpoint for real-time communication"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": "Connected to ADX Agent WebSocket",
            "timestamp": datetime.now().isoformat()
        }))
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process different message types
            message_type = message_data.get("type", "chat")
            
            if message_type == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                }))
            else:
                # Process chat message
                response = {
                    "type": "chat_response",
                    "data": message_data,
                    "timestamp": datetime.now().isoformat()
                }
                await broadcast_message(response)
            
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)

async def broadcast_message(message: dict):
    """Broadcast message to all connected WebSocket clients"""
    if active_connections:
        disconnected = []
        for connection in active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            if conn in active_connections:
                active_connections.remove(conn)

@app.get("/api/sessions")
async def list_sessions():
    """List active chat sessions"""
    return {
        "status": "success",
        "sessions": [
            {
                "session_id": session_id,
                "message_count": len(messages),
                "created_at": messages[0]["timestamp"] if messages else None,
                "last_activity": messages[-1]["timestamp"] if messages else None
            }
            for session_id, messages in chat_sessions.items()
        ],
        "count": len(chat_sessions)
    }

@app.get("/api/sandboxes")
async def list_sandboxes():
    """List active sandbox sessions"""
    return {
        "status": "success",
        "sandboxes": list(sandbox_sessions.values()),
        "count": len(sandbox_sessions)
    }

@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a chat session"""
    if session_id in chat_sessions:
        del chat_sessions[session_id]
        return {"status": "deleted", "session_id": session_id}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )