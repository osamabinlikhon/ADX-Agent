// MCP (Model Context Protocol) Hooks for ADX-Agent

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MCPTool,
  MCPGatewayStatus,
  MCPExecutionRequest,
  MCPExecutionResponse,
  MCPUsageStats,
  MCPStore,
  MCPHealthCheck,
  MCPToolStatus,
} from '@/types/mcp';

const MCP_API_BASE = process.env.NEXT_PUBLIC_MCP_API_BASE || '/api/mcp';

export function useMCPStore(): MCPStore {
  const [gateway, setGateway] = useState<MCPGatewayStatus | null>(null);
  const [tools, setTools] = useState<Record<string, MCPTool>>({});
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<MCPExecutionResponse[]>([]);
  const [usageStats, setUsageStats] = useState<MCPUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    gateway,
    tools,
    selectedTool,
    isExecuting,
    executionHistory,
    usageStats,
    isLoading,
    error,
    // Actions
    setGateway,
    setTools,
    setSelectedTool,
    setIsExecuting,
    setExecutionHistory,
    setUsageStats,
    setIsLoading,
    setError,
  };
}

export function useMCPGateway() {
  const [status, setStatus] = useState<MCPGatewayStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      abortController.current = new AbortController();
      
      const response = await fetch(`${MCP_API_BASE}/status`, {
        signal: abortController.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('MCP Gateway status fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${MCP_API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const isHealthy = response.ok;
      if (!isHealthy) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Health check failed: ${response.status}`);
      }
      
      return isHealthy;
    } catch (err) {
      console.error('MCP Gateway health check failed:', err);
      return false;
    }
  }, []);

  const restartGateway = useCallback(async () => {
    try {
      const response = await fetch(`${MCP_API_BASE}/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Restart failed: ${response.status}`);
      }

      // Wait a bit and then check status
      setTimeout(() => {
        fetchStatus();
      }, 3000);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Restart failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
    
    // Set up periodic status updates
    const interval = setInterval(fetchStatus, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(interval);
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchStatus]);

  return {
    status,
    isLoading,
    error,
    fetchStatus,
    checkHealth,
    restartGateway,
  };
}

export function useMCPTools() {
  const [tools, setTools] = useState<Record<string, MCPTool>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${MCP_API_BASE}/tools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tools: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert array to record format
      const toolsRecord: Record<string, MCPTool> = {};
      data.forEach((tool: MCPTool) => {
        toolsRecord[tool.id] = tool;
      });
      
      setTools(toolsRecord);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tools';
      setError(errorMessage);
      console.error('MCP Tools fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getToolStatus = useCallback(async (toolId: string): Promise<MCPToolStatus> => {
    try {
      const response = await fetch(`${MCP_API_BASE}/tools/${toolId}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Tool health check failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: data.status || 'unknown',
        responseCode: data.responseCode,
        lastCheck: Date.now(),
      };
    } catch (err) {
      console.error(`Tool ${toolId} health check failed:`, err);
      return {
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Health check failed',
        lastCheck: Date.now(),
      };
    }
  }, []);

  const refreshToolStatus = useCallback(async (toolId?: string) => {
    if (toolId) {
      // Check single tool
      const status = await getToolStatus(toolId);
      setTools(prev => ({
        ...prev,
        [toolId]: {
          ...prev[toolId],
          status: status.status === 'healthy' ? 'active' : 'error',
        },
      }));
    } else {
      // Check all tools
      const toolIds = Object.keys(tools);
      const updates = await Promise.all(
        toolIds.map(async (id) => ({
          id,
          status: await getToolStatus(id),
        }))
      );

      setTools(prev => {
        const updated = { ...prev };
        updates.forEach(({ id, status }) => {
          if (updated[id]) {
            updated[id] = {
              ...updated[id],
              status: status.status === 'healthy' ? 'active' : 'error',
            };
          }
        });
        return updated;
      });
    }
  }, [tools, getToolStatus]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  return {
    tools,
    isLoading,
    error,
    fetchTools,
    getToolStatus,
    refreshToolStatus,
  };
}

export function useMCPExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<MCPExecutionResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const executeTool = useCallback(async (request: MCPExecutionRequest): Promise<MCPExecutionResponse> => {
    setIsExecuting(true);
    setError(null);

    const startTime = Date.now();

    try {
      const response = await fetch(`${MCP_API_BASE}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Execution failed: ${response.status}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      const result: MCPExecutionResponse = {
        success: data.success,
        data: data.data,
        error: data.error,
        executionTime,
        toolId: request.toolId,
        timestamp: Date.now(),
      };

      // Add to history
      setExecutionHistory(prev => [result, ...prev.slice(0, 49)]); // Keep last 50

      if (!result.success) {
        throw new Error(result.error || 'Execution failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Execution failed';
      setError(errorMessage);
      
      const result: MCPExecutionResponse = {
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
        toolId: request.toolId,
        timestamp: Date.now(),
      };

      setExecutionHistory(prev => [result, ...prev.slice(0, 49)]);
      
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setExecutionHistory([]);
  }, []);

  const getExecutionByTool = useCallback((toolId: string) => {
    return executionHistory.filter(execution => execution.toolId === toolId);
  }, [executionHistory]);

  return {
    isExecuting,
    executionHistory,
    error,
    executeTool,
    clearHistory,
    getExecutionByTool,
  };
}

export function useMCPUsageStats() {
  const [stats, setStats] = useState<MCPUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${MCP_API_BASE}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch usage stats';
      setError(errorMessage);
      console.error('MCP Usage stats fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats periodically
    const interval = setInterval(fetchStats, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
}

export function useMCPHealthCheck() {
  const [healthCheck, setHealthCheck] = useState<MCPHealthCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const performHealthCheck = useCallback(async () => {
    setIsChecking(true);
    
    try {
      const [gatewayHealthy, toolsStatus] = await Promise.all([
        fetch(`${MCP_API_BASE}/health`).then(r => r.ok),
        Promise.all([
          fetch(`${MCP_API_BASE}/tools/github/health`).then(r => r.ok),
          fetch(`${MCP_API_BASE}/tools/browserbase/health`).then(r => r.ok),
          fetch(`${MCP_API_BASE}/tools/exa/health`).then(r => r.ok),
        ]).then(results => ({
          github: results[0],
          browserbase: results[1],
          exa: results[2],
        })),
      ]);

      setHealthCheck({
        gateway: gatewayHealthy,
        tools: toolsStatus,
        timestamp: Date.now(),
      });

      return {
        gateway: gatewayHealthy,
        tools: toolsStatus,
        overall: gatewayHealthy && Object.values(toolsStatus).some(status => status),
      };
    } catch (err) {
      console.error('MCP Health check failed:', err);
      return {
        gateway: false,
        tools: {
          github: false,
          browserbase: false,
          exa: false,
        },
        overall: false,
      };
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    healthCheck,
    isChecking,
    performHealthCheck,
  };
}

export default {
  useMCPStore,
  useMCPGateway,
  useMCPTools,
  useMCPExecution,
  useMCPUsageStats,
  useMCPHealthCheck,
};