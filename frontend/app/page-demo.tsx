'use client';

import { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Alert, Spin, Steps, Badge } from 'antd';
import { ThunderboltOutlined, RobotOutlined, DesktopOutlined, MessageOutlined } from '@ant-design/icons';
import AgentWorkspace from '@/components/AgentWorkspace';
import SystemStatus from '@/components/SystemStatus';

const { Title, Paragraph } = Typography;
const { Step } = Steps;

export default function DemoPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [systemHealth, setSystemHealth] = useState({
    gemini3: 'checking',
    e2bDesktop: 'checking',
    vncStream: 'checking',
    antDesignX: 'checking'
  });

  useEffect(() => {
    // Simulate system initialization
    const initializeSystem = async () => {
      // Step 1: Check Gemini 3 connection
      setTimeout(() => {
        setSystemHealth(prev => ({ ...prev, gemini3: 'demo' }));
        setCurrentStep(1);
      }, 1000);

      // Step 2: Initialize E2B Desktop
      setTimeout(() => {
        setSystemHealth(prev => ({ ...prev, e2bDesktop: 'demo' }));
        setCurrentStep(2);
      }, 2000);

      // Step 3: Start VNC streaming
      setTimeout(() => {
        setSystemHealth(prev => ({ ...prev, vncStream: 'demo' }));
        setCurrentStep(3);
      }, 3000);

      // Step 4: Finalize
      setTimeout(() => {
        setSystemHealth(prev => ({ ...prev, antDesignX: 'ready' }));
        setCurrentStep(4);
        setIsInitialized(true);
      }, 4000);
    };

    initializeSystem();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4 glass-effect">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Title level={1} className="gradient-text">
                Interactive Coding Assistant
              </Title>
              <Paragraph className="text-lg text-gray-600">
                Initializing demo environment...
              </Paragraph>
              <Alert
                message="Demo Mode"
                description="This is a demonstration version. Full AI features require API keys."
                type="info"
                showIcon
                className="text-left"
              />
            </div>

            <div className="space-y-6">
              <Steps current={currentStep} direction="vertical" size="small">
                <Step 
                  title="Gemini 3 AI" 
                  description="Demo mode - AI features available with API key"
                  status={systemHealth.gemini3 === 'demo' ? 'finish' : systemHealth.gemini3 === 'checking' ? 'process' : 'wait'}
                  icon={systemHealth.gemini3 === 'demo' ? <RobotOutlined /> : <Spin />}
                />
                <Step 
                  title="E2B Desktop" 
                  description="Demo mode - Desktop automation with API key"
                  status={systemHealth.e2bDesktop === 'demo' ? 'finish' : systemHealth.e2bDesktop === 'checking' ? 'process' : 'wait'}
                  icon={systemHealth.e2bDesktop === 'demo' ? <DesktopOutlined /> : <Spin />}
                />
                <Step 
                  title="VNC Streaming" 
                  description="Demo mode - Real-time desktop with API key"
                  status={systemHealth.vncStream === 'demo' ? 'finish' : systemHealth.vncStream === 'checking' ? 'process' : 'wait'}
                  icon={systemHealth.vncStream === 'demo' ? <ThunderboltOutlined /> : <Spin />}
                />
                <Step 
                  title="Ant Design X" 
                  description="Loading rich user interface components"
                  status={systemHealth.antDesignX === 'ready' ? 'finish' : systemHealth.antDesignX === 'checking' ? 'process' : 'wait'}
                  icon={systemHealth.antDesignX === 'ready' ? <MessageOutlined /> : <Spin />}
                />
              </Steps>
            </div>

            {currentStep < 4 && (
              <Alert
                message="Demo Initialization in Progress"
                description="Setting up the demonstration interface..."
                type="info"
                showIcon
                className="text-left"
              />
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="!mb-0 gradient-text">
              Interactive Coding Assistant - Demo
            </Title>
            <p className="text-gray-600 mt-1">
              Demo mode - Add API keys for full functionality
            </p>
          </div>
          <Space>
            <SystemStatus />
            <Button 
              type="primary" 
              icon={<ThunderboltOutlined />}
              onClick={() => window.location.reload()}
            >
              Restart Demo
            </Button>
          </Space>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="h-[calc(100vh-80px)]">
        <AgentWorkspace />
      </div>
    </div>
  );
}
