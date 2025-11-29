import { NextResponse } from "next/server";
import { getGridFS } from "@/lib/gridfs";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

export async function GET(
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

    // Await params (Next.js 15+ requirement)
    const { id } = await context.params;

    // Check if MongoDB is configured
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    // Get document metadata to find gridfsId
    const client = await clientPromise;
    const db = client.db("knowledgehub");
    
    const document = await db.collection("documents").findOne({
      _id: new ObjectId(id),
      deleted: false
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this document
    if (document.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Check if document has gridfsId
    if (!document.gridfsId) {
      return NextResponse.json(
        { success: false, error: "File not found in storage (legacy document)" },
        { status: 404 }
      );
    }

    // Get file from GridFS
    const { bucket } = await getGridFS();
    const gridfsId = new ObjectId(document.gridfsId);

    // Get file info
    const files = await bucket.find({ _id: gridfsId }).toArray();
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "File not found in storage" },
        { status: 404 }
      );
    }

    const fileInfo = files[0];
    const downloadStream = bucket.openDownloadStream(gridfsId);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new Response(buffer, {
      headers: {
        "Content-Type": fileInfo.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${document.filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error("Download error:", err);
    return NextResponse.json(
      { success: false, error: "Download failed", details: err.message },
      { status: 500 }
    );
  }
}
