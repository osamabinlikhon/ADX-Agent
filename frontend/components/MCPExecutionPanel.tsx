// MCP Execution Panel Component for ADX-Agent

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  TextArea,
  Row,
  Col,
  Typography,
  Alert,
  Spin,
  Result,
  Tabs,
  List,
  Tag,
  Space,
  Tooltip,
  Divider,
  Modal,
  Upload,
} from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  HistoryOutlined,
  FileTextOutlined,
  LinkOutlined,
  ImageOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { MCPTool, MCPExecutionRequest, MCPExecutionResponse } from '@/types/mcp';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface MCPExecutionPanelProps {
  tool: MCPTool | null;
  onExecute: (request: MCPExecutionRequest) => Promise<MCPExecutionResponse>;
  isExecuting: boolean;
  executionHistory: MCPExecutionResponse[];
  onClearHistory: () => void;
}

interface FormValues {
  action: string;
  parameters: Record<string, any>;
}

export default function MCPExecutionPanel({
  tool,
  onExecute,
  isExecuting,
  executionHistory,
  onClearHistory,
}: MCPExecutionPanelProps) {
  const [form] = Form.useForm<FormValues>();
  const [result, setResult] = useState<MCPExecutionResponse | null>(null);
  const [activeTab, setActiveTab] = useState('execute');
  const [showHistory, setShowHistory] = useState(false);

  // Reset form when tool changes
  useEffect(() => {
    if (tool) {
      form.resetFields();
      setResult(null);
    }
  }, [tool, form]);

  if (!tool) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            <Title level={4} type="secondary" className="mt-4">
              Select a Tool
            </Title>
            <Text type="secondary">
              Choose an MCP tool from the grid to start executing commands
            </Text>
          </div>
        </div>
      </Card>
    );
  }

  const handleExecute = async (values: FormValues) => {
    if (!tool) return;

    try {
      const request: MCPExecutionRequest = {
        toolId: tool.id,
        action: values.action,
        parameters: values.parameters,
        timeout: 60000, // 60 seconds
      };

      const response = await onExecute(request);
      setResult(response);
      
      if (response.success) {
        setActiveTab('result');
      }
    } catch (error) {
      console.error('Execution failed:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        toolId: tool.id,
        timestamp: Date.now(),
      });
      setActiveTab('result');
    }
  };

  const renderGitHubForm = () => (
    <div className="space-y-4">
      <Form.Item
        name="action"
        label="GitHub Action"
        rules={[{ required: true, message: 'Please select an action' }]}
      >
        <Select placeholder="Select GitHub action">
          <Option value="get_repository">Get Repository</Option>
          <Option value="create_issue">Create Issue</Option>
          <Option value="update_issue">Update Issue</Option>
          <Option value="create_pull_request">Create Pull Request</Option>
          <Option value="list_repositories">List Repositories</Option>
          <Option value="create_branch">Create Branch</Option>
          <Option value="get_file_content">Get File Content</Option>
          <Option value="create_file">Create File</Option>
        </Select>
      </Form.Item>

      <div id="github-dynamic-fields">
        {/* These will be dynamically populated based on the selected action */}
      </div>
    </div>
  );

  const renderBrowserbaseForm = () => (
    <div className="space-y-4">
      <Form.Item
        name="action"
        label="Browserbase Action"
        rules={[{ required: true, message: 'Please select an action' }]}
      >
        <Select placeholder="Select Browserbase action">
          <Option value="screenshot">Take Screenshot</Option>
          <Option value="automate">Web Automation</Option>
          <Option value="extract_content">Extract Content</Option>
          <Option value="fill_form">Fill Form</Option>
          <Option value="click_element">Click Element</Option>
          <Option value="type_text">Type Text</Option>
          <Option value="scroll_page">Scroll Page</Option>
          <Option value="wait_for_element">Wait for Element</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="url"
        label="Target URL"
        rules={[{ required: true, message: 'Please enter a URL' }]}
      >
        <Input placeholder="https://example.com" />
      </Form.Item>

      <Form.Item
        name="options"
        label="Options (JSON)"
      >
        <TextArea
          rows={4}
          placeholder='{"waitFor": "networkidle", "fullPage": true}'
        />
      </Form.Item>
    </div>
  );

  const renderExaForm = () => (
    <div className="space-y-4">
      <Form.Item
        name="action"
        label="Exa Action"
        rules={[{ required: true, message: 'Please select an action' }]}
      >
        <Select placeholder="Select Exa action">
          <Option value="search">Search</Option>
          <Option value="get_content">Get Content</Option>
          <Option value="find_similar">Find Similar</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="query"
        label="Search Query"
        rules={[{ required: true, message: 'Please enter a search query' }]}
      >
        <Input.TextArea
          rows={3}
          placeholder="What are you looking for?"
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="numResults" label="Max Results">
            <Input type="number" min={1} max={50} defaultValue={10} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="contentType" label="Content Type">
            <Select defaultValue="all">
              <Option value="all">All</Option>
              <Option value="html">HTML</Option>
              <Option value="markdown">Markdown</Option>
              <Option value="text">Text</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderFormByTool = () => {
    switch (tool.id) {
      case 'github':
        return renderGitHubForm();
      case 'browserbase':
        return renderBrowserbaseForm();
      case 'exa':
        return renderExaForm();
      default:
        return (
          <div className="space-y-4">
            <Form.Item
              name="action"
              label="Action"
              rules={[{ required: true, message: 'Please enter an action' }]}
            >
              <Input placeholder="Enter action name" />
            </Form.Item>

            <Form.Item
              name="parameters"
              label="Parameters (JSON)"
            >
              <TextArea
                rows={6}
                placeholder='{"key": "value"}'
              />
            </Form.Item>
          </div>
        );
    }
  };

  const renderExecutionHistory = () => {
    const toolHistory = executionHistory.filter(exec => exec.toolId === tool.id);
    
    if (toolHistory.length === 0) {
      return (
        <div className="text-center py-8">
          <HistoryOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <Title level={4} type="secondary" className="mt-4">
            No Execution History
          </Title>
          <Text type="secondary">
            Execute some commands to see your history here
          </Text>
        </div>
      );
    }

    return (
      <List
        dataSource={toolHistory}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                key="view"
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setResult(item)}
              >
                View
              </Button>,
              <Button
                key="copy"
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => navigator.clipboard.writeText(JSON.stringify(item, null, 2))}
              >
                Copy
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                item.success ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                ) : (
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                )
              }
              title={
                <div className="flex items-center space-x-2">
                  <span>{item.toolId}</span>
                  <Tag color={item.success ? 'success' : 'error'}>
                    {item.success ? 'Success' : 'Failed'}
                  </Tag>
                  <Text type="secondary" className="text-xs">
                    <ClockCircleOutlined /> {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </div>
              }
              description={
                <div>
                  {item.executionTime && (
                    <Text type="secondary" className="text-xs">
                      Execution time: {item.executionTime}ms
                    </Text>
                  )}
                  {item.error && (
                    <div className="mt-1">
                      <Text type="danger" className="text-xs">
                        {item.error}
                      </Text>
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const renderExecutionResult = () => {
    if (!result) {
      return (
        <div className="text-center py-8">
          <PlayCircleOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <Title level={4} type="secondary" className="mt-4">
            Ready to Execute
          </Title>
          <Text type="secondary">
            Configure your command and click execute to see results
          </Text>
        </div>
      );
    }

    if (result.success) {
      return (
        <Result
          status="success"
          title="Execution Successful!"
          subTitle={`Executed ${result.toolId} in ${result.executionTime}ms`}
          extra={[
            <Button
              key="copy"
              type="primary"
              icon={<CopyOutlined />}
              onClick={() => navigator.clipboard.writeText(JSON.stringify(result.data, null, 2))}
            >
              Copy Result
            </Button>,
            <Button
              key="download"
              icon={<DownloadOutlined />}
              onClick={() => {
                const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${result.toolId}-result.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download
            </Button>,
          ]}
        >
          <div className="mt-6">
            <Card title="Result Data" size="small">
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </Card>
          </div>
        </Result>
      );
    }

    return (
      <Result
        status="error"
        title="Execution Failed"
        subTitle={result.error || 'Unknown error occurred'}
        extra={[
          <Button
            key="retry"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => setActiveTab('execute')}
          >
            Try Again
          </Button>,
        ]}
      />
    );
  };

  return (
    <Card className="h-full" title={`Execute: ${tool.name}`}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="h-full"
      >
        <TabPane tab="Execute" key="execute">
          <div className="space-y-4">
            <Alert
              message={`Using ${tool.name}`}
              description={tool.description}
              type="info"
              showIcon
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleExecute}
              className="max-w-2xl"
            >
              {renderFormByTool()}

              <Divider />

              <div className="flex justify-between">
                <Button
                  onClick={() => setShowHistory(true)}
                  icon={<HistoryOutlined />}
                >
                  View History ({executionHistory.filter(exec => exec.toolId === tool.id).length})
                </Button>

                <Space>
                  <Button onClick={() => form.resetFields()}>
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={isExecuting ? <StopOutlined /> : <PlayCircleOutlined />}
                    loading={isExecuting}
                    disabled={isExecuting}
                  >
                    {isExecuting ? 'Executing...' : 'Execute'}
                  </Button>
                </Space>
              </div>
            </Form>
          </div>
        </TabPane>

        <TabPane tab="Result" key="result">
          {renderExecutionResult()}
        </TabPane>

        <TabPane tab="History" key="history">
          <div className="flex justify-between items-center mb-4">
            <Title level={4}>Execution History</Title>
            <Space>
              <Button
                icon={<DeleteOutlined />}
                onClick={onClearHistory}
                danger
              >
                Clear All
              </Button>
            </Space>
          </div>
          {renderExecutionHistory()}
        </TabPane>
      </Tabs>

      {/* History Modal */}
      <Modal
        title="Execution History"
        open={showHistory}
        onCancel={() => setShowHistory(false)}
        footer={null}
        width={800}
      >
        <div className="max-h-96 overflow-auto">
          {renderExecutionHistory()}
        </div>
      </Modal>
    </Card>
  );
}