'use client';

import React, { useState } from 'react';
import { Tabs, Card, Typography, Space, Button, Layout, message } from 'antd';
import { 
  CodeOutlined, 
  BranchesOutlined, 
  ToolOutlined, 
  SettingOutlined,
  PlayCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import MCPWorkspace from './MCPWorkspace';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AgentWorkspaceProps {
  className?: string;
}

export default function AgentWorkspace({ className }: AgentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleStartAgent = async () => {
    try {
      setIsAgentRunning(true);
      messageApi.success('Agent started successfully!');
      
      // Initialize agent connection
      const response = await fetch('/api/agent/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'interactive',
          tools: ['mcp', 'e2b', 'gemini']
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start agent');
      }
    } catch (error) {
      setIsAgentRunning(false);
      messageApi.error('Failed to start agent');
      console.error('Agent start error:', error);
    }
  };

  const handleStopAgent = async () => {
    try {
      setIsAgentRunning(false);
      messageApi.info('Agent stopped');
      
      // Stop agent connection
      await fetch('/api/agent/stop', { method: 'POST' });
    } catch (error) {
      console.error('Agent stop error:', error);
    }
  };

  const tabItems = [
    {
      key: 'chat',
      label: (
        <Space>
          <CodeOutlined />
          Interactive Chat
        </Space>
      ),
      children: (
        <Card className="h-full" bodyStyle={{ height: 'calc(100vh - 200px)', padding: 0 }}>
          <div className="p-6">
            <Title level={4}>AI Chat Interface</Title>
            <p className="text-gray-600">
              Interactive chat interface with Gemini AI integration.
              Chat functionality will be implemented in the next phase.
            </p>
          </div>
        </Card>
      ),
    },
    {
      key: 'mcp',
      label: (
        <Space>
          <ToolOutlined />
          MCP Tools
        </Space>
      ),
      children: <MCPWorkspace />,
    },
    {
      key: 'code',
      label: (
        <Space>
          <BranchesOutlined />
          Code Editor
        </Space>
      ),
      children: (
        <Card className="h-full" bodyStyle={{ height: 'calc(100vh - 200px)', padding: 0 }}>
          <div className="p-6">
            <Title level={4}>Code Editor</Title>
            <p className="text-gray-600">
              Advanced code editor with syntax highlighting and AI assistance.
              This will integrate with the E2B Desktop SDK for file operations.
            </p>
          </div>
        </Card>
      ),
    },
    {
      key: 'settings',
      label: (
        <Space>
          <SettingOutlined />
          Settings
        </Space>
      ),
      children: (
        <Card className="h-full">
          <Title level={4}>System Settings</Title>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Mode
              </label>
              <p className="text-gray-600">Configure agent behavior and capabilities</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tool Integration
              </label>
              <p className="text-gray-600">Manage MCP tools and external integrations</p>
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Layout className={`h-full ${className}`}>
        {/* Agent Control Header */}
        <Header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <Title level={4} className="!mb-0">
              Agent Workspace
            </Title>
            <Space>
              <Button
                type={isAgentRunning ? "default" : "primary"}
                icon={isAgentRunning ? <StopOutlined /> : <PlayCircleOutlined />}
                onClick={isAgentRunning ? handleStopAgent : handleStartAgent}
                disabled={activeTab !== 'mcp' && !isAgentRunning}
              >
                {isAgentRunning ? 'Stop Agent' : 'Start Agent'}
              </Button>
            </Space>
          </div>
        </Header>

        {/* Main Content Area */}
        <Content className="bg-gray-50">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="h-full"
            tabBarStyle={{ margin: 0, background: '#fff', padding: '0 16px' }}
          />
        </Content>
      </Layout>
    </>
  );
}