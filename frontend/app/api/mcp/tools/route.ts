import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // In production, this would fetch from the MCP gateway
    // For now, return mock data that matches our TypeScript types
    const tools = [
      {
        id: 'github',
        name: 'GitHub',
        description: 'Access GitHub repositories, issues, and pull requests',
        category: 'Development',
        enabled: true,
        config: {
          auth_required: true,
          endpoint: 'https://api.github.com'
        }
      },
      {
        id: 'browserbase',
        name: 'Browserbase',
        description: 'Web automation and browser control',
        category: 'Automation',
        enabled: true,
        config: {
          auth_required: true,
          endpoint: 'https://api.browserbase.com'
        }
      },
      {
        id: 'exa',
        name: 'Exa',
        description: 'AI-powered web search and content extraction',
        category: 'Search',
        enabled: true,
        config: {
          auth_required: true,
          endpoint: 'https://api.exa.com'
        }
      },
      {
        id: 'filesystem',
        name: 'File System',
        description: 'Local file system operations',
        category: 'System',
        enabled: true,
        config: {
          auth_required: false,
          endpoint: 'local'
        }
      },
      {
        id: 'docker',
        name: 'Docker',
        description: 'Container management and operations',
        category: 'Infrastructure',
        enabled: false,
        config: {
          auth_required: true,
          endpoint: 'local'
        }
      },
      {
        id: 'postgres',
        name: 'PostgreSQL',
        description: 'Database operations and queries',
        category: 'Database',
        enabled: false,
        config: {
          auth_required: true,
          endpoint: 'local'
        }
      }
    ];

    return NextResponse.json({
      tools,
      total: tools.length,
      enabled: tools.filter(t => t.enabled).length
    });
  } catch (error) {
    console.error('MCP Tools API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MCP tools' },
      { status: 500 }
    );
  }
}