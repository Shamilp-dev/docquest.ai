import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized - Please log in"
      }, { status: 401 });
    }

    const { MongoClient } = await import('mongodb');
    const uri = process.env.MONGODB_URI || '';
    const client = new MongoClient(uri);
    await client.connect();

    try {
      const db = client.db("knowledgehub");

      // Filter documents by userId AND exclude deleted
      const docs = await db
        .collection("documents")
        .find({ 
          userId: user.id,  // Only get documents for this user
          deleted: { $ne: true }  // Exclude deleted documents
        })
        .sort({ createdAt: -1 })
        .toArray();

      // Convert MongoDB ObjectId to string for JSON serialization
      const serializedDocs = docs.map(doc => ({
        ...doc,
        _id: doc._id.toString(),
        createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
      }));

      return NextResponse.json({ documents: serializedDocs });

    } finally {
      await client.close();
    }

  } catch (error) {
    console.error("FETCH_DOCS_ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log full error details for debugging
    console.error("Full error details:", {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json({ 
      error: "Failed to fetch documents",
      details: errorMessage,
      // Only include stack in development
      ...(process.env.NODE_ENV === 'development' && errorStack ? { stack: errorStack } : {})
    }, { status: 500 });
  }
}
