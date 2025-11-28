// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongoose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 30 * 60; // 30 minutes
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role?: string;
}

export interface Session {
  user: User;
  lastActivity: number;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({ 
    user,
    lastActivity: Date.now()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(SECRET_KEY);
  
  return token;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    const payload = verified.payload as unknown as Session;
    
    // Check inactivity timeout
    const now = Date.now();
    if (now - payload.lastActivity > INACTIVITY_TIMEOUT) {
      return null; // Session expired due to inactivity
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(user: User): Promise<void> {
  const token = await createToken(user);
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// Get session from cookie
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

// Update last activity
export async function updateActivity(): Promise<void> {
  const session = await getSession();
  if (!session) return;
  
  // Create new token with updated activity
  await setAuthCookie(session.user);
}

// Clear auth cookie
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Require authentication (for API routes)
export async function requireAuth(): Promise<User> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  // Update activity on each request
  await updateActivity();
  
  return session.user;
}

// Require admin role
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  
  // Check if user has admin role in database
  await dbConnect();
  const UserModel = (await import('@/lib/models/user')).default;
  const dbUser = await UserModel.findById(user.id);
  
  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return user;
}
