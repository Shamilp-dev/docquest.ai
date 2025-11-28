import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";
import { getGridFS } from "@/lib/gridfs";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("knowledgehub");

    // Check if this is a permanent delete (query parameter)
    const url = new URL(req.url);
    const permanent = url.searchParams.get('permanent') === 'true';

    if (permanent) {
      // Permanent delete: Remove from both documents collection and GridFS
      const document = await db
        .collection("documents")
        .findOne({ 
          _id: new ObjectId(id),
          userId: user.id  // Security: Only delete user's own documents
        });

      if (!document) {
        return NextResponse.json(
          { error: "Document not found or you don't have permission" },
          { status: 404 }
        );
      }

      // Delete from GridFS if gridfsId exists
      if (document.gridfsId) {
        try {
          const { bucket } = await getGridFS();
          await bucket.delete(new ObjectId(document.gridfsId));
          console.log("Deleted file from GridFS:", document.gridfsId);
        } catch (gridfsError) {
          console.error("GridFS delete error:", gridfsError);
          // Continue even if GridFS delete fails
        }
      }

      // Delete document metadata
      await db.collection("documents").deleteOne({ _id: new ObjectId(id) });

      return NextResponse.json({
        success: true,
        message: "Document permanently deleted",
      });
    } else {
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
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("knowledgehub");

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
  } catch (error) {
    console.error("RESTORE_DOC_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to restore document" },
      { status: 500 }
    );
  }
}
