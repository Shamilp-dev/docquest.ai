import { NextResponse } from 'next/server';

/**
 * Simple Health Check Endpoint
 * 
 * Ultra-lightweight endpoint for UptimeRobot monitoring.
 * Returns immediately to keep function warm.
 */

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    message: '🚀 Server is running!'
  });
}

// Disable caching for health checks
export const dynamic = 'force-dynamic';
export const revalidate = 0;
