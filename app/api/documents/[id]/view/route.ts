import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuth } from "@/lib/auth";

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
        return new NextResponse(
          `<html><body><h1>Invalid Document ID</h1><p>The document ID provided is not valid.</p></body></html>`,
          {
            status: 400,
            headers: { "Content-Type": "text/html" }
          }
        );
      }

      // Find document (only user's own documents)
      const document = await db
        .collection("documents")
        .findOne({
          _id: new ObjectId(id),
          userId: user.id
        });

      if (!document) {
        return new NextResponse(
          `<html><body><h1>Document Not Found</h1><p>The document you're looking for doesn't exist or you don't have permission to view it.</p></body></html>`,
          {
            status: 404,
            headers: { "Content-Type": "text/html" }
          }
        );
      }

      // Build HTML preview based on file type
      const filename = document.filename || "Untitled";
      const fileType = (document.type || "").toLowerCase();
      const extractedText = document.extractedText || document.text || "";
      
      let contentHtml = "";
      
      // For images, show the image if we have a URL or base64 data
      if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileType)) {
        contentHtml = `
          <div style="text-align: center; padding: 20px;">
            <p style="color: #666; margin-bottom: 20px;">Image preview not available in this view.</p>
            ${extractedText ? `
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: left; margin-top: 20px;">
                <h3 style="color: #333; margin-bottom: 10px;">Extracted Text (OCR):</h3>
                <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; line-height: 1.6;">${extractedText}</pre>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        // For documents, show extracted text
        if (extractedText) {
          contentHtml = `
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <pre style="white-space: pre-wrap; font-family: Georgia, serif; line-height: 1.8; color: #333;">${extractedText}</pre>
            </div>
          `;
        } else {
          contentHtml = `
            <div style="text-align: center; padding: 40px; color: #666;">
              <p>No preview available for this document.</p>
              <p style="margin-top: 10px; font-size: 14px;">Text extraction may still be in progress.</p>
            </div>
          `;
        }
      }

      // Create HTML document
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${filename} - Document Preview</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: #f0f2f5;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header p {
              margin: 5px 0 0 0;
              opacity: 0.9;
              font-size: 14px;
            }
            .container {
              max-width: 900px;
              margin: 30px auto;
              padding: 0 20px;
            }
            .metadata {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .metadata-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .metadata-row:last-child {
              border-bottom: none;
            }
            .metadata-label {
              font-weight: 600;
              color: #666;
            }
            .metadata-value {
              color: #333;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              min-height: 400px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${filename}</h1>
            <p>Document Preview</p>
          </div>
          <div class="container">
            <div class="metadata">
              <div class="metadata-row">
                <span class="metadata-label">Type:</span>
                <span class="metadata-value">${fileType.toUpperCase() || 'Unknown'}</span>
              </div>
              <div class="metadata-row">
                <span class="metadata-label">Owner:</span>
                <span class="metadata-value">${document.owner || user.username}</span>
              </div>
              <div class="metadata-row">
                <span class="metadata-label">Size:</span>
                <span class="metadata-value">${typeof document.size === 'number' ? (document.size / 1024 / 1024).toFixed(2) + ' MB' : document.size || 'Unknown'}</span>
              </div>
              <div class="metadata-row">
                <span class="metadata-label">Created:</span>
                <span class="metadata-value">${document.createdAt ? new Date(document.createdAt).toLocaleString() : 'Unknown'}</span>
              </div>
              ${document.pages ? `
              <div class="metadata-row">
                <span class="metadata-label">Pages:</span>
                <span class="metadata-value">${document.pages}</span>
              </div>
              ` : ''}
            </div>
            <div class="content">
              ${contentHtml}
            </div>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        }
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("VIEW_DOC_ERROR:", error);
    return new NextResponse(
      `<html><body><h1>Error</h1><p>Failed to load document: ${error instanceof Error ? error.message : 'Unknown error'}</p></body></html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" }
      }
    );
  }
}
