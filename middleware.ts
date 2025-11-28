import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

interface Session {
  user: {
    id: string;
    email: string;
    username: string;
    role?: string;
  };
  lastActivity: number;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/security-question',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token
    const verified = await jwtVerify(token, SECRET_KEY);
    const session = verified.payload as unknown as Session;
    const userRole = session.user.role || 'user';

    // Role-based routing
    if (userRole === 'admin') {
      // Admin trying to access user dashboard - redirect to admin
      if (pathname === '/' || pathname.startsWith('/knowledgeDashboard')) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      // Allow admin API routes
      if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname.startsWith('/api/')) {
        return NextResponse.next();
      }
    } else {
      // Regular user trying to access admin routes - redirect to user dashboard
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      // Block admin API routes for regular users
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Allow user routes
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
    // Invalid token - clear and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
