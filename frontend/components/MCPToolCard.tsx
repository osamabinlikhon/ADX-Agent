// MCP Tool Card Component for ADX-Agent

'use client';

import React from 'react';
import { Card, Button, Tag, Space, Tooltip, Typography } from 'antd';
import {
  GithubOutlined,
  ChromeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  SettingOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { MCPTool } from '@/types/mcp';

const { Text, Paragraph } = Typography;

interface MCPToolCardProps {
  tool: MCPTool;
  onSelect: (toolId: string) => void;
  onConfigure?: (toolId: string) => void;
  isSelected?: boolean;
  disabled?: boolean;
}

const toolIcons: Record<string, React.ReactNode> = {
  github: <GithubOutlined style={{ fontSize: 24, color: '#333' }} />,
  browserbase: <ChromeOutlined style={{ fontSize: 24, color: '#4285f4' }} />,
  exa: <SearchOutlined style={{ fontSize: 24, color: '#ff6b6b' }} />,
  notion: <SettingOutlined style={{ fontSize: 24, color: '#000' }} />,
  stripe: <PlayCircleOutlined style={{ fontSize: 24, color: '#635bff' }} />,
  airtable: <SettingOutlined style={{ fontSize: 24, color: '#18bfff' }} />,
};

const categoryColors: Record<string, string> = {
  development: 'blue',
  testing: 'green',
  research: 'purple',
  productivity: 'orange',
  custom: 'default',
};

const statusConfig = {
  active: {
    color: 'success' as const,
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    text: 'Active',
  },
  inactive: {
    color: 'default' as const,
    icon: <ClockCircleOutlined style={{ color: '#d9d9d9' }} />,
    text: 'Inactive',
  },
  error: {
    color: 'error' as const,
    icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
    text: 'Error',
  },
  loading: {
    color: 'processing' as const,
    icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
    text: 'Loading',
  },
};

export default function MCPToolCard({
  tool,
  onSelect,
  onConfigure,
  isSelected = false,
  disabled = false,
}: MCPToolCardProps) {
  const status = statusConfig[tool.status];
  const icon = toolIcons[tool.id] || <SettingOutlined style={{ fontSize: 24, color: '#666' }} />;

  const handleSelect = () => {
    if (!disabled && tool.status === 'active') {
      onSelect(tool.id);
    }
  };

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConfigure) {
      onConfigure(tool.id);
    }
  };

  return (
    <Card
      className={`
        mcp-tool-card
        ${isSelected ? 'mcp-tool-card-selected' : ''}
        ${disabled ? 'mcp-tool-card-disabled' : ''}
        ${tool.status === 'error' ? 'mcp-tool-card-error' : ''}
        ${tool.status === 'active' ? 'mcp-tool-card-active' : ''}
      `}
      hoverable={!disabled && tool.status === 'active'}
      onClick={handleSelect}
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <Text strong className="text-base">
                {tool.name}
              </Text>
              <div className="flex items-center space-x-2 mt-1">
                <Tag color={categoryColors[tool.category]} size="small">
                  {tool.category}
                </Tag>
                {status.icon}
                <Text type="secondary" className="text-xs">
                  {status.text}
                </Text>
              </div>
            </div>
          </div>
          
          {onConfigure && (
            <Tooltip title="Configure Tool">
              <Button
                type="text"
                size="small"
                icon={<SettingOutlined />}
                onClick={handleConfigure}
                className="mcp-tool-config-btn"
              />
            </Tooltip>
          )}
        </div>

        {/* Description */}
        <div className="flex-1 mb-3">
          <Paragraph 
            className="text-sm text-gray-600 mb-0" 
            ellipsis={{ rows: 2, expandable: false }}
          >
            {tool.description}
          </Paragraph>
        </div>

        {/* Features */}
        {tool.permissions && tool.permissions.length > 0 && (
          <div className="mb-3">
            <Text type="secondary" className="text-xs block mb-1">
              Capabilities:
            </Text>
            <div className="flex flex-wrap gap-1">
              {tool.permissions.slice(0, 3).map((permission, index) => (
                <Tag key={index} size="small" className="text-xs">
                  {permission}
                </Tag>
              ))}
              {tool.permissions.length > 3 && (
                <Tag size="small" className="text-xs">
                  +{tool.permissions.length - 3} more
                </Tag>
              )}
            </div>
          </div>
        )}

        {/* Version and Author */}
        {(tool.version || tool.author) && (
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div>
              {tool.version && <Text type="secondary">v{tool.version}</Text>}
              {tool.version && tool.author && <span className="mx-1">•</span>}
              {tool.author && <Text type="secondary">{tool.author}</Text>}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto">
          <Button
            type={isSelected ? 'primary' : 'default'}
            block
            size="small"
            disabled={disabled || tool.status !== 'active'}
            onClick={handleSelect}
            className="mcp-tool-select-btn"
          >
            {isSelected ? 'Selected' : 'Select Tool'}
          </Button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .mcp-tool-card {
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .mcp-tool-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .mcp-tool-card-selected {
          border-color: #1890ff;
          background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
        }

        .mcp-tool-card-active {
          border-color: #52c41a;
        }

        .mcp-tool-card-error {
          border-color: #ff4d4f;
          background: linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%);
        }

        .mcp-tool-card-disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .mcp-tool-config-btn:hover {
          background-color: #f0f0f0;
        }

        .mcp-tool-select-btn {
          transition: all 0.2s ease;
        }

        .mcp-tool-select-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </Card>
  );
}