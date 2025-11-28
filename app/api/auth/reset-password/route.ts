import { NextResponse } from 'next/server';
import User from '@/lib/models/user';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';

export async function POST(req: Request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await req.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'User ID and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('User not found for password reset:', userId);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = passwordHash;
    await user.save();

    console.log('Password reset successfully for user:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { success: false, error: 'Server error during password reset' },
      { status: 500 }
    );
  }
}
