import { NextResponse } from 'next/server';
import { requireAuth, setAuthCookie } from '@/lib/auth';
import User from '@/lib/models/user';
import dbConnect from '@/lib/mongoose';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { username, avatar } = await req.json();

    console.log('Updating profile for user:', user.id, { username, avatar });

    const dbUser = await User.findById(user.id);
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update username if provided
    if (username && username.trim()) {
      dbUser.username = username.trim();
    }

    // Update avatar if provided
    if (avatar !== undefined) {
      dbUser.avatar = avatar;
    }

    await dbUser.save();

    // Update JWT cookie with new username
    await setAuthCookie({
      id: dbUser._id.toString(),
      email: dbUser.email,
      username: dbUser.username,
      role: dbUser.role,
      avatar: dbUser.avatar
    });

    console.log('Profile updated successfully');

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser._id.toString(),
        email: dbUser.email,
        username: dbUser.username,
        avatar: dbUser.avatar,
        role: dbUser.role
      }
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
