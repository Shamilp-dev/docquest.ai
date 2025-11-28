// app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getAnalytics } from "@/lib/models/analytics";
import { requireAuth } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Get authenticated user
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized - Please log in"
      }, { status: 401 });
    }

    const uri = process.env.MONGODB_URI || '';
    
    if (!uri) {
      return NextResponse.json(
        { error: "MongoDB not configured" },
        { status: 503 }
      );
    }

    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      const analytics = await getAnalytics(client, user.id);
      
      return NextResponse.json(analytics);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("ANALYTICS_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
