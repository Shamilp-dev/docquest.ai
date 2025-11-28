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
    const { email, username, password, securityQuestion, securityAnswer } = body;

    // Validate required fields
    if (!email || !password || !username) {
      console.error('Missing required fields:', { email: !!email, password: !!password, username: !!username });
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, username, and password are required' },
        { status: 400 }
      );
    }

    if (!securityQuestion || !securityAnswer) {
      console.error('Missing security fields:', { securityQuestion: !!securityQuestion, securityAnswer: !!securityAnswer });
      return NextResponse.json(
        { success: false, error: 'Security question and answer are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      console.error('Email already registered:', email);
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password and security answer
    const passwordHash = await bcrypt.hash(password, 12);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

    console.log('Creating new user with data:', {
      email: email.toLowerCase().trim(),
      username: username.trim(),
      hasPassword: !!passwordHash,
      securityQuestion,
      hasSecurityAnswer: !!securityAnswerHash
    });

    // Create new user
    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password: passwordHash,
      securityQuestion: securityQuestion,
      securityAnswer: securityAnswerHash,
    });

    console.log('User created successfully:', {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      hasSecurityQuestion: !!newUser.securityQuestion,
      hasSecurityAnswer: !!newUser.securityAnswer
    });

    // Set auth cookie after signup so user is logged in automatically
    await setAuthCookie({
      id: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      role: newUser.role
    });

    return NextResponse.json(
      { 
        success: true, 
        user: { 
          id: newUser._id, 
          email: newUser.email, 
          username: newUser.username 
        } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.code === 11000) {
      // Duplicate key error
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }
    
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(error.errors).map((e: any) => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: `Validation error: ${messages}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during signup' },
      { status: 500 }
    );
  }
}
