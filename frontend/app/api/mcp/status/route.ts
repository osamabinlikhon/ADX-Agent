import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // In production, this would check the actual MCP gateway status
    // For now, return mock gateway status
    const gatewayStatus = {
      status: 'online' as const,
      version: '1.0.0',
      connected_tools: 4,
      total_tools: 6,
      uptime: '2d 14h 32m',
      last_heartbeat: new Date().toISOString(),
      memory_usage: 45.2,
      cpu_usage: 12.8,
      active_connections: 3,
      health_checks: {
        github: { status: 'online', latency: 120 },
        browserbase: { status: 'online', latency: 85 },
        exa: { status: 'online', latency: 95 },
        filesystem: { status: 'online', latency: 15 }
      }
    };

    return NextResponse.json(gatewayStatus);

  } catch (error) {
    console.error('MCP Status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get MCP gateway status' },
      { status: 500 }
    );
  }
}