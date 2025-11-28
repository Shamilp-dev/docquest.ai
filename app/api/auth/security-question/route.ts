import { NextResponse } from 'next/server';
import User from '@/lib/models/user';
import dbConnect from '@/lib/mongoose';

export async function POST(req: Request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.error('User not found for security question:', email);
      // Return 404 to properly indicate user not found
      return NextResponse.json(
        { success: false, error: 'No account found with this email address.' },
        { status: 404 }
      );
    }

    // Check if security question exists
    if (!user.securityQuestion || user.securityQuestion === '') {
      console.error('No security question set for user:', email);
      return NextResponse.json(
        { success: false, error: 'No security question set for this account. Please contact support.' },
        { status: 400 }
      );
    }

    console.log('Security question retrieved for user:', email);

    return NextResponse.json({
      success: true,
      securityQuestion: user.securityQuestion
    });

  } catch (error: any) {
    console.error('Get security question error:', error);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { success: false, error: 'Server error while retrieving security question' },
      { status: 500 }
    );
  }
}
