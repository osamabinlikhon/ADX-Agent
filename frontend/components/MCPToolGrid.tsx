// MCP Tool Grid Component for ADX-Agent

'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  Input,
  Select,
  Space,
  Button,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
  Empty,
  Spin,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  GithubOutlined,
  ChromeOutlined,
  SearchOutlined as ExaIcon,
  SettingOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { MCPTool } from '@/types/mcp';
import MCPToolCard from './MCPToolCard';

const { Title, Text } = Typography;
const { Option } = Select;

interface MCPToolGridProps {
  tools: Record<string, MCPTool>;
  isLoading?: boolean;
  error?: string | null;
  selectedTool?: string | null;
  onSelectTool: (toolId: string) => void;
  onConfigureTool?: (toolId: string) => void;
  onRefresh?: () => void;
  onAddTool?: () => void;
  className?: string;
}

const toolIcons: Record<string, React.ReactNode> = {
  github: <GithubOutlined />,
  browserbase: <ChromeOutlined />,
  exa: <ExaIcon />,
  notion: <SettingOutlined />,
  stripe: <PlayCircleOutlined />,
  airtable: <SettingOutlined />,
};

const categoryOptions = [
  { value: 'all', label: 'All Categories', count: 0 },
  { value: 'development', label: 'Development', count: 0 },
  { value: 'testing', label: 'Testing', count: 0 },
  { value: 'research', label: 'Research', count: 0 },
  { value: 'productivity', label: 'Productivity', count: 0 },
  { value: 'custom', label: 'Custom', count: 0 },
];

const statusOptions = [
  { value: 'all', label: 'All Status', count: 0 },
  { value: 'active', label: 'Active', count: 0 },
  { value: 'inactive', label: 'Inactive', count: 0 },
  { value: 'error', label: 'Error', count: 0 },
  { value: 'loading', label: 'Loading', count: 0 },
];

export default function MCPToolGrid({
  tools,
  isLoading = false,
  error = null,
  selectedTool = null,
  onSelectTool,
  onConfigureTool,
  onRefresh,
  onAddTool,
  className = '',
}: MCPToolGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Convert tools object to array
  const toolArray = useMemo(() => Object.values(tools), [tools]);

  // Filter tools based on search and filters
  const filteredTools = useMemo(() => {
    let filtered = toolArray;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        tool =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(tool => tool.status === selectedStatus);
    }

    return filtered;
  }, [toolArray, searchQuery, selectedCategory, selectedStatus]);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};

    toolArray.forEach(tool => {
      categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
      statusCounts[tool.status] = (statusCounts[tool.status] || 0) + 1;
    });

    return {
      categories: categoryCounts,
      status: statusCounts,
    };
  }, [toolArray]);

  // Update option counts
  const categoryOptionsWithCounts = categoryOptions.map(option => ({
    ...option,
    count: option.value === 'all' 
      ? toolArray.length 
      : filterCounts.categories[option.value] || 0,
  }));

  const statusOptionsWithCounts = statusOptions.map(option => ({
    ...option,
    count: option.value === 'all' 
      ? toolArray.length 
      : filterCounts.status[option.value] || 0,
  }));

  const handleToolSelect = (toolId: string) => {
    onSelectTool(toolId);
  };

  const handleToolConfigure = (toolId: string) => {
    if (onConfigureTool) {
      onConfigureTool(toolId);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleAddTool = () => {
    if (onAddTool) {
      onAddTool();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Spin size="large" tip="Loading MCP tools..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert
        message="Failed to load MCP tools"
        description={error}
        type="error"
        showIcon
        className={className}
        action={
          onRefresh && (
            <Button size="small" type="primary" onClick={handleRefresh}>
              Retry
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Title level={3} className="!mb-2">
              MCP Tools
            </Title>
            <Text type="secondary">
              {filteredTools.length} of {toolArray.length} tools available
            </Text>
          </div>
          
          <Space>
            {onAddTool && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTool}
              >
                Add Tool
              </Button>
            )}
            {onRefresh && (
              <Tooltip title="Refresh tools">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={isLoading}
                />
              </Tooltip>
            )}
          </Space>
        </div>

        {/* Filters */}
        <Card size="small" className="mb-4">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search tools..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
              />
            </Col>
            
            <Col xs={24} sm={6} md={4}>
              <Select
                placeholder="Category"
                value={selectedCategory}
                onChange={setSelectedCategory}
                className="w-full"
                suffixIcon={<FilterOutlined />}
              >
                {categoryOptionsWithCounts.map(option => (
                  <Option key={option.value} value={option.value}>
                    <div className="flex justify-between items-center">
                      <span>{option.label}</span>
                      <Tag size="small" className="ml-2">
                        {option.count}
                      </Tag>
                    </div>
                  </Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} sm={6} md={4}>
              <Select
                placeholder="Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                className="w-full"
              >
                {statusOptionsWithCounts.map(option => (
                  <Option key={option.value} value={option.value}>
                    <div className="flex justify-between items-center">
                      <span>{option.label}</span>
                      <Tag size="small" className="ml-2">
                        {option.count}
                      </Tag>
                    </div>
                  </Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} sm={24} md={8}>
              <div className="flex items-center justify-end space-x-2">
                <Text type="secondary" className="text-sm">
                  Status:
                </Text>
                <div className="flex space-x-2">
                  <Tag color="success" size="small">
                    {filterCounts.status.active || 0} Active
                  </Tag>
                  <Tag color="error" size="small">
                    {filterCounts.status.error || 0} Error
                  </Tag>
                  <Tag color="default" size="small">
                    {filterCounts.status.inactive || 0} Inactive
                  </Tag>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Tool Grid */}
      {filteredTools.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredTools.map(tool => (
            <Col
              key={tool.id}
              xs={24}
              sm={12}
              lg={8}
              xl={6}
              xxl={6}
            >
              <MCPToolCard
                tool={tool}
                onSelect={handleToolSelect}
                onConfigure={handleToolConfigure}
                isSelected={selectedTool === tool.id}
                disabled={tool.status === 'loading'}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="py-12">
          <Empty
            description={
              <div className="text-center">
                <Text type="secondary">
                  {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'No tools match your filters'
                    : 'No MCP tools available'}
                </Text>
                <div className="mt-2">
                  {onAddTool && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddTool}
                    >
                      Add First Tool
                    </Button>
                  )}
                </div>
              </div>
            }
          />
        </div>
      )}

      {/* Summary */}
      {filteredTools.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing {filteredTools.length} of {toolArray.length} tools
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              {selectedStatus !== 'all' && ` with ${selectedStatus} status`}
            </div>
            <div className="flex items-center space-x-4">
              <span>
                <strong>{filterCounts.status.active || 0}</strong> active
              </span>
              <span>
                <strong>{filterCounts.status.error || 0}</strong> error
              </span>
              <span>
                <strong>{filterCounts.status.inactive || 0}</strong> inactive
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}