// MCP (Model Context Protocol) Types for ADX-Agent

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'testing' | 'research' | 'productivity' | 'custom';
  status: 'active' | 'inactive' | 'error' | 'loading';
  icon: string;
  version?: string;
  author?: string;
  permissions: string[];
  config?: Record<string, any>;
}

export interface MCPToolConfig {
  timeout?: number;
  maxRetries?: number;
  rateLimit?: {
    requests: number;
    window: string;
  };
  features?: string[];
  environment?: Record<string, string>;
}

export interface MCPGatewayStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  version: string;
  timestamp: number;
  uptime?: number;
  connections?: number;
  tools?: Record<string, MCPToolStatus>;
}

export interface MCPToolStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseCode?: number;
  lastCheck?: number;
  errorMessage?: string;
}

export interface MCPExecutionRequest {
  toolId: string;
  action: string;
  parameters: Record<string, any>;
  timeout?: number;
}

export interface MCPExecutionResponse {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  toolId: string;
  timestamp: number;
}

export interface MCPGatewayConfig {
  port: number;
  host: string;
  maxConnections: number;
  timeout: number;
  cors: {
    enabled: boolean;
    origins: string[];
    methods: string[];
  };
  auth: {
    enabled: boolean;
    tokenExpiry: number;
  };
}

export interface MCPHealthCheck {
  gateway: boolean;
  tools: Record<string, boolean>;
  timestamp: number;
}

export interface MCPUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  activeConnections: number;
  toolsUsed: Record<string, number>;
  lastUsed?: number;
}

export interface MCPToolDefinition {
  command: string;
  args: string[];
  env?: Record<string, string>;
  workingDirectory?: string;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

// GitHub MCP Tool Types
export interface GitHubRepository {
  name: string;
  full_name: string;
  description?: string;
  private: boolean;
  html_url: string;
  default_branch: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed' | 'merged';
  html_url: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  user: {
    login: string;
    avatar_url: string;
  };
}

// Browserbase MCP Tool Types
export interface BrowserbaseScreenshotRequest {
  url: string;
  options?: {
    fullPage?: boolean;
    waitFor?: 'networkidle' | 'domcontentloaded' | 'load';
    timeout?: number;
    viewport?: {
      width: number;
      height: number;
    };
  };
}

export interface BrowserbaseAutomationRequest {
  url: string;
  actions: BrowserbaseAction[];
  options?: {
    headless?: boolean;
    timeout?: number;
  };
}

export interface BrowserbaseAction {
  type: 'click' | 'type' | 'scroll' | 'wait' | 'screenshot';
  selector?: string;
  text?: string;
  x?: number;
  y?: number;
  waitTime?: number;
}

// Exa MCP Tool Types
export interface ExaSearchRequest {
  query: string;
  options?: {
    numResults?: number;
    contentType?: 'all' | 'html' | 'markdown' | 'text';
    includeDomains?: string[];
    excludeDomains?: string[];
  };
}

export interface ExaSearchResult {
  id: string;
  title: string;
  url: string;
  summary?: string;
  content?: string;
  publishedDate?: string;
  score?: number;
}

export interface ExaContentRequest {
  urls: string[];
  options?: {
    extractMode?: 'semantic' | 'raw' | 'both';
    maxContentLength?: number;
  };
}

// Frontend UI State Types
export interface MCPStore {
  gateway: MCPGatewayStatus | null;
  tools: Record<string, MCPTool>;
  selectedTool: string | null;
  isExecuting: boolean;
  executionHistory: MCPExecutionResponse[];
  usageStats: MCPUsageStats | null;
  isLoading: boolean;
  error: string | null;
}

// Form Types
export interface MCPExecutionForm {
  toolId: string;
  action: string;
  parameters: Record<string, any>;
}

// Component Props Types
export interface MCPToolCardProps {
  tool: MCPTool;
  onSelect: (toolId: string) => void;
  onConfigure?: (toolId: string) => void;
}

export interface MCPExecutionPanelProps {
  tool: MCPTool | null;
  onExecute: (request: MCPExecutionRequest) => void;
  isExecuting: boolean;
}

export interface MCPStatusPanelProps {
  gatewayStatus: MCPGatewayStatus | null;
  toolStatus: Record<string, MCPToolStatus>;
  onRefresh: () => void;
  isLoading: boolean;
}

// API Response Types
export interface MCPAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface MCPHealthAPIResponse extends MCPAPIResponse<MCPGatewayStatus> {}

export interface MCPStatusAPIResponse extends MCPAPIResponse<MCPGatewayStatus & { tools: Record<string, MCPToolStatus> }> {}

export interface MCPExecuteAPIResponse extends MCPAPIResponse<MCPExecutionResponse> {}

export interface MCPListAPIResponse extends MCPAPIResponse<MCPTool[]> {}

// Error Types
export interface MCPError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
}

export interface MCPValidationError extends MCPError {
  field: string;
  value: any;
}

// Configuration Types
export interface MCPFrontendConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  showAdvancedOptions: boolean;
  defaultTimeout: number;
  maxHistoryItems: number;
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export default {};