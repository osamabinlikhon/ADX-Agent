'use client';

import { useState, useEffect } from 'react';
import { ConfigProvider, theme, Card, Typography, Button, Space, Alert, Badge } from 'antd';
import { ThunderboltOutlined, RobotOutlined, ToolOutlined } from '@ant-design/icons';
import AgentWorkspace from '@/components/AgentWorkspace';
import SystemStatus from '@/components/SystemStatus';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(false);

  useEffect(() => {
    // Check if API keys are available
    const checkApiKeys = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHasApiKeys(data.hasApiKeys || false);
      } catch (error) {
        console.log('Health check failed, showing demo mode');
      }
      
      // Simulate initialization
      setTimeout(() => {
        setIsInitialized(true);
      }, 2000);
    };

    checkApiKeys();
  }, []);

  if (!isInitialized) {
    return (
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Card className="w-full max-w-2xl mx-4">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <Title level={1}>
                  Interactive Coding Assistant
                </Title>
                <Paragraph className="text-lg text-gray-600">
                  AI-powered desktop automation with 200+ tools via MCP integration
                </Paragraph>
                
                {!hasApiKeys && (
                  <Alert
                    message="Demo Mode"
                    description="API keys not found. The interface is ready, but full AI features require API configuration."
                    type="info"
                    showIcon
                    className="text-left"
                  />
                )}
              </div>

              <div className="flex items-center justify-center space-x-4">
                <RobotOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                <span className="text-gray-600">Initializing system...</span>
                <ThunderboltOutlined style={{ fontSize: 24, color: '#1677ff' }} />
              </div>
            </div>
          </Card>
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="!mb-0">
                Interactive Coding Assistant
                <Badge 
                  count="MCP" 
                  style={{ 
                    backgroundColor: '#1677ff', 
                    marginLeft: 12,
                    fontSize: 12,
                    height: 18,
                    lineHeight: '16px'
                  }} 
                />
              </Title>
              <p className="text-gray-600 mt-1">
                AI-powered desktop automation with 200+ tools via MCP {hasApiKeys ? 'with full capabilities' : '(Demo Mode)'}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <ToolOutlined style={{ fontSize: 14, color: '#1677ff' }} />
                  <span className="text-sm text-gray-500">GitHub • Browserbase • Exa • Docker</span>
                </div>
              </div>
            </div>
            <Space>
              <SystemStatus />
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />}
                onClick={() => window.location.reload()}
              >
                Restart
              </Button>
            </Space>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="h-[calc(100vh-80px)]">
          <AgentWorkspace />
        </div>
      </div>
    </ConfigProvider>
  );
}
