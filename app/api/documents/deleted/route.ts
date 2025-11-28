// app/api/documents/deleted/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

// Get all deleted files for the current user
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
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      const db = client.db("knowledgehub");

      const docs = await db
        .collection("documents")
        .find({ 
          userId: user.id,  // Only get user's deleted documents
          deleted: true 
        })
        .sort({ deletedAt: -1 })
        .toArray();

      const serializedDocs = docs.map(doc => ({
        ...doc,
        _id: doc._id.toString(),
        createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
        deletedAt: doc.deletedAt instanceof Date ? doc.deletedAt.toISOString() : doc.deletedAt,
      }));

      return NextResponse.json({ documents: serializedDocs });

    } finally {
      await client.close();
    }

  } catch (error) {
    console.error("FETCH_DELETED_ERROR:", error);
    return NextResponse.json({ 
      error: "Failed to fetch deleted documents",
    }, { status: 500 });
  }
}

// Empty trash - permanently delete all user's deleted documents
export async function DELETE() {
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
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      const db = client.db("knowledgehub");

      const result = await db
        .collection("documents")
        .deleteMany({ 
          userId: user.id,  // Only delete user's documents
          deleted: true 
        });

      return NextResponse.json({
        success: true,
        message: `Permanently deleted ${result.deletedCount} documents`,
        count: result.deletedCount
      });

    } finally {
      await client.close();
    }

  } catch (error) {
    console.error("EMPTY_TRASH_ERROR:", error);
    return NextResponse.json({ 
      error: "Failed to empty trash",
    }, { status: 500 });
  }
}

// Bulk restore
export async function POST(req: Request) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized - Please log in"
      }, { status: 401 });
    }

    const { ids } = await req.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid IDs array" },
        { status: 400 }
      );
    }

    const uri = process.env.MONGODB_URI || '';
    const client = new MongoClient(uri);
    await client.connect();

    try {
      const db = client.db("knowledgehub");
      
      const objectIds = ids
        .filter(id => ObjectId.isValid(id))
        .map(id => new ObjectId(id));

      // Only restore documents that belong to this user
      const result = await db
        .collection("documents")
        .updateMany(
          { 
            _id: { $in: objectIds },
            userId: user.id  // Security: Only restore user's own documents
          },
          { 
            $set: { deleted: false },
            $unset: { deletedAt: "" }
          }
        );

      return NextResponse.json({
        success: true,
        message: `Restored ${result.modifiedCount} documents`,
        count: result.modifiedCount
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("BULK_RESTORE_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to restore documents" },
      { status: 500 }
    );
  }
}
