import { NextResponse } from 'next/server';

/**
 * Keep-Alive Endpoint
 * 
 * This endpoint is pinged by UptimeRobot every 5 minutes to keep
 * Vercel serverless functions warm and prevent cold starts.
 * 
 * Setup Instructions:
 * 1. Go to https://uptimerobot.com (free account, no credit card)
 * 2. Create a new HTTP(s) monitor
 * 3. URL: https://your-app.vercel.app/api/keepalive
 * 4. Monitoring Interval: 5 minutes
 * 5. That's it! Your functions stay warm 24/7 for free!
 */

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    
    // Ping critical endpoints to keep them warm
    const endpoints = [
      '/api/documents',
      '/api/analytics',
    ];

    // Fire and forget - don't wait for responses
    const pingPromises = endpoints.map(endpoint => 
      fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { 'X-Keep-Alive': 'true' }
      }).catch(() => null) // Ignore errors
    );

    // Wait for all pings (with timeout)
    await Promise.race([
      Promise.all(pingPromises),
      new Promise(resolve => setTimeout(resolve, 3000)) // 3s timeout
    ]);

    return NextResponse.json({
      status: 'warm',
      message: 'Functions are warm and ready! 🔥',
      timestamp: new Date().toISOString(),
      endpoints: endpoints.length
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Keep-alive ping failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
