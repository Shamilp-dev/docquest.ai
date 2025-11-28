import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

// Soft delete - Move to trash
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized - Please log in"
      }, { status: 401 });
    }

    const { id } = await context.params;

    const { MongoClient } = await import("mongodb");
    const uri = process.env.MONGODB_URI || "";

    if (!uri) {
      return NextResponse.json(
        { error: "MongoDB not configured" },
        { status: 503 }
      );
    }

    const client = new MongoClient(uri);
    await client.connect();

    try {
      const db = client.db("knowledgehub");

      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "Invalid document ID" },
          { status: 400 }
        );
      }

      // Soft delete: mark as deleted (only if document belongs to user)
      const result = await db
        .collection("documents")
        .updateOne(
          { 
            _id: new ObjectId(id),
            userId: user.id  // Security: Only delete user's own documents
          },
          { 
            $set: { 
              deleted: true,
              deletedAt: new Date()
            } 
          }
        );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: "Document not found or you don't have permission" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Document moved to trash",
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("DELETE_DOC_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

// Restore from trash
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized - Please log in"
      }, { status: 401 });
    }

    const { id } = await context.params;
    const { action } = await req.json();
    
    const { MongoClient } = await import("mongodb");
    const uri = process.env.MONGODB_URI || "";

    if (!uri) {
      return NextResponse.json(
        { error: "MongoDB not configured" },
        { status: 503 }
      );
    }

    const client = new MongoClient(uri);
    await client.connect();

    try {
      const db = client.db("knowledgehub");

      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "Invalid document ID" },
          { status: 400 }
        );
      }

      if (action === "restore") {
        // Only restore if document belongs to user
        const result = await db
          .collection("documents")
          .updateOne(
            { 
              _id: new ObjectId(id),
              userId: user.id  // Security: Only restore user's own documents
            },
            { 
              $set: { deleted: false },
              $unset: { deletedAt: "" }
            }
          );

        if (result.matchedCount === 0) {
          return NextResponse.json(
            { error: "Document not found or you don't have permission" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Document restored successfully",
        });
      }

      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("RESTORE_DOC_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to restore document" },
      { status: 500 }
    );
  }
}
