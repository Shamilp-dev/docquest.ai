import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import User from '@/lib/models/user';
import dbConnect from '@/lib/mongoose';
import { MongoClient } from 'mongodb';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Delete user (admin only)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    
    const { id } = await context.params;

    // Delete user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Also delete user's documents
    const uri = process.env.MONGODB_URI || '';
    const client = new MongoClient(uri);
    await client.connect();

    try {
      const db = client.db("knowledgehub");
      await db.collection("documents").deleteMany({ userId: id });
      await db.collection("chats").deleteMany({ userId: id });
      await db.collection("search_queries").deleteMany({ userId: id });
    } finally {
      await client.close();
    }

    return NextResponse.json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
