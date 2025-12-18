// MCP Workspace Component for ADX-Agent

'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Alert,
  Tabs,
  Drawer,
  Badge,
  notification,
  Spin,
} from 'antd';
import {
  ToolOutlined,
  DashboardOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ReloadOutlined,
  WifiOutlined,
  WifiOffOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import {
  useMCPGateway,
  useMCPTools,
  useMCPExecution,
  useMCPUsageStats,
  useMCPHealthCheck,
} from '@/hooks/useMCP';
import MCPToolGrid from './MCPToolGrid';
import MCPExecutionPanel from './MCPExecutionPanel';
import MCPStatusDashboard from './MCPStatusDashboard';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function MCPWorkspace() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showStatusDrawer, setShowStatusDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState('tools');

  // Custom hooks for MCP management
  const {
    status: gatewayStatus,
    isLoading: gatewayLoading,
    error: gatewayError,
    fetchStatus,
    checkHealth,
    restartGateway,
  } = useMCPGateway();

  const {
    tools,
    isLoading: toolsLoading,
    error: toolsError,
    fetchTools,
    refreshToolStatus,
  } = useMCPTools();

  const {
    isExecuting,
    executionHistory,
    error: executionError,
    executeTool,
    clearHistory,
    getExecutionByTool,
  } = useMCPExecution();

  const {
    stats: usageStats,
    isLoading: statsLoading,
    error: statsError,
    fetchStats,
  } = useMCPUsageStats();

  const {
    healthCheck,
    isChecking,
    performHealthCheck,
  } = useMCPHealthCheck();

  // Combine tool status
  const toolStatus = tools ? Object.keys(tools).reduce((acc, toolId) => {
    const tool = tools[toolId];
    acc[toolId] = {
      status: tool.status === 'active' ? 'healthy' : tool.status,
      responseCode: 200,
      lastCheck: Date.now(),
    };
    return acc;
  }, {} as Record<string, any>) : {};

  // Handle tool selection
  const handleSelectTool = (toolId: string) => {
    setSelectedTool(toolId);
    setActiveTab('execute');
  };

  // Handle tool configuration
  const handleConfigureTool = (toolId: string) => {
    notification.info({
      message: 'Configure Tool',
      description: `Tool configuration for ${toolId} will be available soon.`,
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    await Promise.all([
      fetchStatus(),
      fetchTools(),
      fetchStats(),
      performHealthCheck(),
    ]);
    notification.success({
      message: 'Refreshed',
      description: 'MCP system status has been updated.',
    });
  };

  // Handle gateway restart
  const handleRestartGateway = async () => {
    try {
      await restartGateway();
      notification.success({
        message: 'Gateway Restarted',
        description: 'MCP gateway has been successfully restarted.',
      });
      setTimeout(() => {
        handleRefresh();
      }, 5000);
    } catch (error) {
      notification.error({
        message: 'Restart Failed',
        description: 'Failed to restart MCP gateway. Please try again.',
      });
    }
  };

  // Initial load
  useEffect(() => {
    handleRefresh();
  }, []);

  // Get overall system status
  const getSystemStatus = () => {
    if (gatewayError || !gatewayStatus || gatewayStatus.status !== 'healthy') {
      return { status: 'error', text: 'Offline', color: '#ff4d4f' };
    }

    const healthyTools = Object.values(toolStatus).filter(
      status => status.status === 'healthy'
    ).length;

    const totalTools = Object.keys(toolStatus).length;

    if (totalTools === 0) {
      return { status: 'warning', text: 'No Tools', color: '#faad14' };
    }

    if (healthyTools === totalTools) {
      return { status: 'success', text: 'All Active', color: '#52c41a' };
    } else if (healthyTools > 0) {
      return { status: 'warning', text: `${healthyTools}/${totalTools} Active`, color: '#faad14' };
    } else {
      return { status: 'error', text: 'All Offline', color: '#ff4d4f' };
    }
  };

  const systemStatus = getSystemStatus();

  // Render main layout
  return (
    <Layout className="mcp-workspace">
      {/* Header */}
      <Header className="mcp-workspace-header bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ToolOutlined style={{ fontSize: 20, color: '#1677ff' }} />
              <Title level={3} className="!mb-0">
                MCP Tools
              </Title>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                status={systemStatus.status as any}
                text={
                  <Text className={`font-medium`} style={{ color: systemStatus.color }}>
                    {systemStatus.text}
                  </Text>
                }
              />
            </div>
          </div>

          <Space>
            <Button
              icon={systemStatus.status === 'success' ? <WifiOutlined /> : <WifiOffOutlined />}
              onClick={() => setShowStatusDrawer(true)}
              className="flex items-center"
            >
              Status
            </Button>

            <Button
              icon={<ExperimentOutlined />}
              onClick={() => setActiveTab(activeTab === 'tools' ? 'execute' : 'tools')}
            >
              {activeTab === 'tools' ? 'Execute' : 'Tools'}
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={gatewayLoading || toolsLoading || isChecking}
              title="Refresh MCP system"
            >
              Refresh
            </Button>

            {gatewayStatus && gatewayStatus.status === 'healthy' && (
              <Button
                icon={<SettingOutlined />}
                onClick={handleRestartGateway}
                title="Restart MCP Gateway"
              >
                Restart Gateway
              </Button>
            )}
          </Space>
        </div>
      </Header>

      {/* Main Content */}
      <Layout className="mcp-workspace-content">
        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
          {/* System Status Alert */}
          {gatewayError && (
            <Alert
              message="MCP Gateway Offline"
              description={
                <div>
                  <Text>The MCP gateway is not responding. This could indicate:</Text>
                  <ul className="mt-2 ml-4">
                    <li>• Gateway service is not running</li>
                    <li>• Network connectivity issues</li>
                    <li>• Service configuration problems</li>
                  </ul>
                  <div className="mt-3">
                    <Space>
                      <Button type="primary" onClick={handleRefresh}>
                        Retry Connection
                      </Button>
                      {gatewayStatus?.status !== 'healthy' && (
                        <Button onClick={handleRestartGateway}>
                          Restart Gateway
                        </Button>
                      )}
                    </Space>
                  </div>
                </div>
              }
              type="error"
              showIcon
              className="mb-6"
            />
          )}

          {/* Main Workspace Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="mcp-workspace-tabs"
          >
            <TabPane tab="Tools" key="tools">
              <MCPToolGrid
                tools={tools}
                isLoading={toolsLoading}
                error={toolsError}
                selectedTool={selectedTool}
                onSelectTool={handleSelectTool}
                onConfigureTool={handleConfigureTool}
                onRefresh={fetchTools}
                className="mcp-tool-grid"
              />
            </TabPane>

            <TabPane tab="Execute" key="execute">
              <Row gutter={16} className="h-full">
                <Col xs={24} lg={selectedTool ? 12 : 24}>
                  {selectedTool ? (
                    <MCPToolGrid
                      tools={tools}
                      isLoading={toolsLoading}
                      error={toolsError}
                      selectedTool={selectedTool}
                      onSelectTool={handleSelectTool}
                      onConfigureTool={handleConfigureTool}
                      onRefresh={fetchTools}
                      className="mcp-tool-grid-compact"
                    />
                  ) : (
                    <Card className="h-full">
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <PlayCircleOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                          <Title level={4} type="secondary" className="mt-4">
                            Select a Tool to Execute
                          </Title>
                          <Text type="secondary">
                            Choose a tool from the Tools tab to start executing commands
                          </Text>
                        </div>
                      </div>
                    </Card>
                  )}
                </Col>

                {selectedTool && (
                  <Col xs={24} lg={12}>
                    <MCPExecutionPanel
                      tool={tools[selectedTool] || null}
                      onExecute={executeTool}
                      isExecuting={isExecuting}
                      executionHistory={executionHistory}
                      onClearHistory={clearHistory}
                    />
                  </Col>
                )}
              </Row>
            </TabPane>

            <TabPane tab="Dashboard" key="dashboard">
              <MCPStatusDashboard
                gatewayStatus={gatewayStatus}
                toolStatus={toolStatus}
                usageStats={usageStats}
                isLoading={gatewayLoading || statsLoading}
                error={gatewayError || toolsError || statsError}
                onRefresh={handleRefresh}
                onRestartGateway={handleRestartGateway}
                onConfigureTool={handleConfigureTool}
              />
            </TabPane>
          </Tabs>
        </Content>
      </Layout>

      {/* Status Drawer */}
      <Drawer
        title="MCP System Status"
        placement="right"
        width={400}
        open={showStatusDrawer}
        onClose={() => setShowStatusDrawer(false)}
      >
        <MCPStatusDashboard
          gatewayStatus={gatewayStatus}
          toolStatus={toolStatus}
          usageStats={usageStats}
          isLoading={gatewayLoading || statsLoading}
          error={gatewayError || toolsError || statsError}
          onRefresh={handleRefresh}
          onRestartGateway={handleRestartGateway}
          onConfigureTool={handleConfigureTool}
        />
      </Drawer>

      {/* Loading Overlay */}
      {(gatewayLoading || toolsLoading) && !gatewayStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <Spin size="large" />
              <div>
                <Title level={4}>Loading MCP System</Title>
                <Text type="secondary">Initializing tools and gateway...</Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .mcp-workspace {
          min-height: 100vh;
        }

        .mcp-workspace-header {
          box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
        }

        .mcp-workspace-content {
          min-height: calc(100vh - 64px);
        }

        .mcp-workspace-tabs .ant-tabs-content-holder {
          padding-top: 16px;
        }

        .mcp-tool-grid {
          min-height: 600px;
        }

        .mcp-tool-grid-compact {
          min-height: 400px;
        }

        .mcp-workspace .ant-card {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .mcp-workspace .ant-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </Layout>
  );
}