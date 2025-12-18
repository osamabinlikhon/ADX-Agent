// MCP Status Dashboard Component for ADX-Agent

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Button,
  Space,
  Alert,
  Typography,
  List,
  Tooltip,
  Badge,
  Spin,
  Timeline,
  Divider,
  Modal,
  Input,
  Form,
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  GithubOutlined,
  ChromeOutlined,
  SearchOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  UserOutlined,
  DatabaseOutlined,
  WifiOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import {
  MCPGatewayStatus,
  MCPToolStatus,
  MCPUsageStats,
} from '@/types/mcp';

const { Title, Text, Paragraph } = Typography;

interface MCPStatusDashboardProps {
  gatewayStatus: MCPGatewayStatus | null;
  toolStatus: Record<string, MCPToolStatus>;
  usageStats: MCPUsageStats | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onRestartGateway?: () => void;
  onConfigureTool?: (toolId: string) => void;
}

const toolIcons: Record<string, React.ReactNode> = {
  github: <GithubOutlined />,
  browserbase: <ChromeOutlined />,
  exa: <SearchOutlined />,
  notion: <SettingOutlined />,
  stripe: <PlayCircleOutlined />,
  airtable: <SettingOutlined />,
};

export default function MCPStatusDashboard({
  gatewayStatus,
  toolStatus,
  usageStats,
  isLoading,
  error,
  onRefresh,
  onRestartGateway,
  onConfigureTool,
}: MCPStatusDashboardProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configToolId, setConfigToolId] = useState<string>('');

  const handleRefresh = () => {
    onRefresh();
  };

  const handleRestartGateway = () => {
    if (onRestartGateway) {
      onRestartGateway();
    }
  };

  const handleConfigureTool = (toolId: string) => {
    setConfigToolId(toolId);
    setShowConfigModal(true);
  };

  const getOverallStatus = () => {
    if (!gatewayStatus || gatewayStatus.status !== 'healthy') {
      return { status: 'error', color: '#ff4d4f', text: 'Critical' };
    }

    const healthyTools = Object.values(toolStatus).filter(
      status => status.status === 'healthy'
    ).length;

    const totalTools = Object.keys(toolStatus).length;

    if (healthyTools === totalTools) {
      return { status: 'success', color: '#52c41a', text: 'Healthy' };
    } else if (healthyTools > 0) {
      return { status: 'warning', color: '#faad14', text: 'Partial' };
    } else {
      return { status: 'error', color: '#ff4d4f', text: 'Unhealthy' };
    }
  };

  const overallStatus = getOverallStatus();

  const renderGatewayStatus = () => (
    <Card title="Gateway Status" className="mb-4">
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="Status"
            value={gatewayStatus?.status || 'unknown'}
            prefix={
              gatewayStatus?.status === 'healthy' ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              )
            }
            valueStyle={{
              color: gatewayStatus?.status === 'healthy' ? '#52c41a' : '#ff4d4f'
            }}
          />
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="Version"
            value={gatewayStatus?.version || 'N/A'}
            prefix={<ThunderboltOutlined />}
          />
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="Uptime"
            value={
              gatewayStatus?.uptime
                ? `${Math.floor(gatewayStatus.uptime / 3600)}h ${Math.floor((gatewayStatus.uptime % 3600) / 60)}m`
                : 'N/A'
            }
            prefix={<ClockCircleOutlined />}
          />
        </Col>
      </Row>

      {gatewayStatus?.connections && (
        <Row gutter={16} className="mt-4">
          <Col xs={24} sm={12}>
            <div className="flex items-center space-x-2">
              <WifiOutlined />
              <Text>Active Connections: {gatewayStatus.connections}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="flex items-center space-x-2">
              <GlobalOutlined />
              <Text>Last Check: {new Date(gatewayStatus.timestamp).toLocaleTimeString()}</Text>
            </div>
          </Col>
        </Row>
      )}

      <Divider />
      
      <div className="flex justify-between items-center">
        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
          {onRestartGateway && (
            <Button
              icon={<StopOutlined />}
              onClick={handleRestartGateway}
              danger
            >
              Restart Gateway
            </Button>
          )}
        </Space>
        
        <Tag color={overallStatus.color} className="text-sm font-medium">
          System {overallStatus.text}
        </Tag>
      </div>
    </Card>
  );

  const renderToolStatus = () => (
    <Card title="Tool Status" className="mb-4">
      {Object.keys(toolStatus).length === 0 ? (
        <div className="text-center py-8">
          <SettingOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <Title level={4} type="secondary" className="mt-4">
            No Tools Configured
          </Title>
          <Text type="secondary">
            Tools will appear here once the gateway is healthy
          </Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {Object.entries(toolStatus).map(([toolId, status]) => (
            <Col xs={24} sm={12} md={8} lg={6} key={toolId}>
              <Card size="small" className="text-center">
                <div className="mb-2">
                  {toolIcons[toolId] || <SettingOutlined />}
                </div>
                <Title level={5} className="!mb-2 capitalize">
                  {toolId}
                </Title>
                <div className="mb-2">
                  <Badge
                    status={
                      status.status === 'healthy'
                        ? 'success'
                        : status.status === 'unhealthy'
                        ? 'error'
                        : 'warning'
                    }
                    text={
                      status.status === 'healthy'
                        ? 'Healthy'
                        : status.status === 'unhealthy'
                        ? 'Unhealthy'
                        : 'Unknown'
                    }
                  />
                </div>
                {status.responseCode && (
                  <Text type="secondary" className="text-xs">
                    HTTP {status.responseCode}
                  </Text>
                )}
                {status.errorMessage && (
                  <Tooltip title={status.errorMessage}>
                    <AlertOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
                  </Tooltip>
                )}
                {status.lastCheck && (
                  <div className="mt-2">
                    <Text type="secondary" className="text-xs">
                      {new Date(status.lastCheck).toLocaleTimeString()}
                    </Text>
                  </div>
                )}
                {onConfigureTool && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleConfigureTool(toolId)}
                    className="mt-2"
                  >
                    Configure
                  </Button>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );

  const renderUsageStats = () => (
    <Card title="Usage Statistics" className="mb-4">
      {usageStats ? (
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Requests"
              value={usageStats.totalRequests}
              prefix={<DatabaseOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Success Rate"
              value={
                usageStats.totalRequests > 0
                  ? ((usageStats.successfulRequests / usageStats.totalRequests) * 100).toFixed(1)
                  : 0
              }
              suffix="%"
              precision={1}
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color: usageStats.totalRequests > 0 && 
                       (usageStats.successfulRequests / usageStats.totalRequests) > 0.9 
                       ? '#52c41a' : '#faad14'
              }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Avg Response Time"
              value={usageStats.averageResponseTime}
              suffix="ms"
              precision={0}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>
      ) : (
        <div className="text-center py-4">
          <Text type="secondary">No usage statistics available</Text>
        </div>
      )}
      
      {usageStats && usageStats.toolsUsed && Object.keys(usageStats.toolsUsed).length > 0 && (
        <>
          <Divider />
          <Title level={5}>Most Used Tools</Title>
          <List
            size="small"
            dataSource={Object.entries(usageStats.toolsUsed)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)}
            renderItem={([toolId, count]) => (
              <List.Item>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    {toolIcons[toolId] || <SettingOutlined />}
                    <Text className="capitalize">{toolId}</Text>
                  </div>
                  <Tag>{count} uses</Tag>
                </div>
              </List.Item>
            )}
          />
        </>
      )}
    </Card>
  );

  const renderSystemHealth = () => (
    <Card title="System Health">
      <Timeline>
        <Timeline.Item
          color={gatewayStatus?.status === 'healthy' ? 'green' : 'red'}
          dot={
            gatewayStatus?.status === 'healthy' ? (
              <CheckCircleOutlined />
            ) : (
              <ExclamationCircleOutlined />
            )
          }
        >
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Gateway</Text>
              <div>
                <Text type="secondary">
                  {gatewayStatus?.status === 'healthy' 
                    ? 'All systems operational'
                    : 'Gateway is not responding'
                  }
                </Text>
              </div>
            </div>
            <Tag color={gatewayStatus?.status === 'healthy' ? 'success' : 'error'}>
              {gatewayStatus?.status || 'unknown'}
            </Tag>
          </div>
        </Timeline.Item>

        {Object.entries(toolStatus).map(([toolId, status]) => (
          <Timeline.Item
            key={toolId}
            color={status.status === 'healthy' ? 'green' : 'red'}
            dot={
              status.status === 'healthy' ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              )
            }
          >
            <div className="flex justify-between items-center">
              <div>
                <Text strong className="capitalize">{toolId}</Text>
                <div>
                  <Text type="secondary">
                    {status.status === 'healthy'
                      ? 'Tool is responding correctly'
                      : status.errorMessage || 'Tool is not responding'
                    }
                  </Text>
                </div>
              </div>
              <Tag color={status.status === 'healthy' ? 'success' : 'error'}>
                {status.status}
              </Tag>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert
          message="MCP System Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      )}

      {/* Loading State */}
      {isLoading && !gatewayStatus && (
        <div className="text-center py-8">
          <Spin size="large" tip="Loading MCP status..." />
        </div>
      )}

      {/* Status Dashboard */}
      {!isLoading && (
        <>
          {renderGatewayStatus()}
          {renderToolStatus()}
          {renderUsageStats()}
          {renderSystemHealth()}
        </>
      )}

      {/* Configuration Modal */}
      <Modal
        title={`Configure ${configToolId}`}
        open={showConfigModal}
        onCancel={() => setShowConfigModal(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Tool ID">
            <Input value={configToolId} disabled />
          </Form.Item>
          
          <Form.Item label="Status">
            <Tag color={toolStatus[configToolId]?.status === 'healthy' ? 'success' : 'error'}>
              {toolStatus[configToolId]?.status || 'unknown'}
            </Tag>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" onClick={() => setShowConfigModal(false)}>
                Save
              </Button>
              <Button onClick={() => setShowConfigModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}