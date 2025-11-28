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
    const { email, securityAnswer } = body;

    if (!email || !securityAnswer) {
      return NextResponse.json(
        { success: false, error: 'Email and security answer are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.error('User not found for forgot password:', email);
      // Return 401 for incorrect answer (generic error)
      return NextResponse.json(
        { success: false, error: 'Incorrect security answer' },
        { status: 401 }
      );
    }

    // Check if security question and answer exist
    if (!user.securityQuestion || !user.securityAnswer || 
        user.securityQuestion === '' || user.securityAnswer === '') {
      console.error('No security question/answer set for user:', email);
      return NextResponse.json(
        { success: false, error: 'No security question set for this account. Please contact support.' },
        { status: 400 }
      );
    }

    // Verify security answer
    const isValid = await bcrypt.compare(
      securityAnswer.toLowerCase().trim(),
      user.securityAnswer
    );

    if (!isValid) {
      console.error('Incorrect security answer for user:', email);
      return NextResponse.json(
        { success: false, error: 'Incorrect security answer' },
        { status: 401 }
      );
    }

    console.log('Security answer verified for user:', email);

    // Return success with user ID (for password reset step)
    return NextResponse.json({
      success: true,
      userId: user._id.toString(),
      securityQuestion: user.securityQuestion
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { success: false, error: 'Server error during password recovery' },
      { status: 500 }
    );
  }
}
