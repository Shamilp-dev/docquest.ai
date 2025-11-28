import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import User from '@/lib/models/user';
import dbConnect from '@/lib/mongoose';

// Get all users (admin only)
export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const users = await User.find({})
      .select('-password -securityAnswer')
      .sort({ createdAt: -1 })
      .lean();

    const serializedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
      lastSeen: user.lastSeen instanceof Date ? user.lastSeen.toISOString() : user.lastSeen,
    }));

    return NextResponse.json({
      success: true,
      users: serializedUsers
    });

  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
