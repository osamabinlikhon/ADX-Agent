import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    // In production, this would stop the actual agent process
    // For now, simulate agent shutdown
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Agent stopped successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Agent Stop API error:', error);
    return NextResponse.json(
      { error: 'Failed to stop agent' },
      { status: 500 }
    );
  }
}