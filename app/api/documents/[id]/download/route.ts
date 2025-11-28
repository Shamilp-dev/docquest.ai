import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import path from 'path';
import { readFile } from 'fs/promises';
import fs from 'fs';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const user = await requireAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 16
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Connect to MongoDB
    if (!clientPromise) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
    }
    
    const client = await clientPromise;
    const db = client.db('knowledgehub');
    const documentsCollection = db.collection('documents');

    // Find the document
    const document = await documentsCollection.findOne({
      _id: new ObjectId(id),
      userId: user.id
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get file path
    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, document.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Determine content type based on file extension
    const ext = document.filename.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp'
    };

    const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';

    // Return file as response
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${document.filename}"`,
      },
    });

  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download document' },
      { status: 500 }
    );
  }
}
