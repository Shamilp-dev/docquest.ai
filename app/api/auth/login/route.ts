import { NextResponse } from 'next/server';
import User from '@/lib/models/user';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import { setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      console.error('Missing login credentials');
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.error('User not found:', email);
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.error('Invalid password for user:', email);
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log('User logged in successfully:', {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // Update user online status
    user.isOnline = true;
    user.lastSeen = new Date();
    user.lastActivity = new Date();
    await user.save();

    // Set auth cookie with avatar
    await setAuthCookie({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar || ''
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar || ''
      },
      redirectTo: user.role === 'admin' ? '/admin' : '/'
    });
  } catch (error: any) {
    console.error("Login error:", error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { success: false, error: error.message || "Server error during login" },
      { status: 500 }
    );
  }
}
