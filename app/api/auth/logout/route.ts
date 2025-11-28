import { NextResponse } from 'next/server';
import { getSession, clearAuthCookie } from '@/lib/auth';
import User from '@/lib/models/user';
import dbConnect from '@/lib/mongoose';

export async function POST() {
  try {
    // Get current session
    const session = await getSession();
    
    if (session) {
      // Update user online status
      await dbConnect();
      await User.findByIdAndUpdate(session.user.id, {
        isOnline: false,
        lastSeen: new Date()
      });
    }

    // Clear auth cookie
    await clearAuthCookie();

    return NextResponse.json({ 
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
