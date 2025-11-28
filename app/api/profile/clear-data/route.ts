import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Chat from '@/lib/models/chat';
import dbConnect from '@/lib/mongoose';
import { MongoClient } from 'mongodb';

export async function DELETE() {
  try {
    const user = await requireAuth();
    await dbConnect();

    console.log('Clearing all data for user:', user.id);

    // Connect to MongoDB directly for documents collection
    const uri = process.env.MONGODB_URI || '';
    const client = new MongoClient(uri);
    await client.connect();

    try {
      const db = client.db("knowledgehub");
      
      // Delete all documents for this user from the documents collection
      const docResult = await db.collection("documents").deleteMany({ userId: user.id });
      console.log('Deleted', docResult.deletedCount, 'documents for user:', user.id);

      // Delete all chat messages for this user using Mongoose
      const chatResult = await Chat.deleteMany({ userId: user.id });
      console.log('Deleted', chatResult.deletedCount, 'chat sessions for user:', user.id);

      return NextResponse.json({
        success: true,
        message: `Deleted ${docResult.deletedCount} document(s) and ${chatResult.deletedCount} chat session(s)`,
        deletedCount: docResult.deletedCount,
        chatDeletedCount: chatResult.deletedCount
      });
    } finally {
      await client.close();
    }
  } catch (error: any) {
    console.error('Error clearing user data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear data' },
      { status: 500 }
    );
  }
}
