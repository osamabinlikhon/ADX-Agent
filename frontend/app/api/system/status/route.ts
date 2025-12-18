import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // In production, this would check actual service health
    // For now, return realistic mock data
    const statusData = {
      services: {
        backend: { 
          status: 'online' as const, 
          latency: Math.floor(Math.random() * 100) + 20 
        },
        desktop: { 
          status: 'online' as const, 
          latency: Math.floor(Math.random() * 200) + 80 
        },
        mcp_gateway: { 
          status: 'online' as const, 
          latency: Math.floor(Math.random() * 50) + 15 
        },
        database: { 
          status: 'online' as const, 
          latency: Math.floor(Math.random() * 30) + 10 
        },
      },
      resources: {
        cpu_usage: Math.floor(Math.random() * 40) + 20, // 20-60%
        memory_usage: Math.floor(Math.random() * 30) + 50, // 50-80%
        disk_usage: Math.floor(Math.random() * 20) + 30, // 30-50%
        network_status: 'connected' as const,
      },
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(statusData);

  } catch (error) {
    console.error('System Status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get system status' },
      { status: 500 }
    );
  }
}