import { NextResponse } from 'next/server';
import { getSession, updateActivity } from '@/lib/auth';
import User from '@/lib/models/user';
import dbConnect from '@/lib/mongoose';

export async function POST() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    // Update JWT activity
    await updateActivity();

    // Update database online status and activity
    await dbConnect();
    await User.findByIdAndUpdate(session.user.id, {
      isOnline: true,
      lastActivity: new Date(),
      lastSeen: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity update error:', error);
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );
  }
}
