import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/admin',
  '/coding',
  '/interview'
];

// Paths that require admin access
const adminPaths = [
  '/admin'
];

// API paths that require authentication
const protectedApiPaths = [
  '/api/resume',
  '/api/admin',
  '/api/coding/analyze'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/signin') ||
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/init') ||
    pathname.includes('.') ||
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  // Check if path requires authentication
  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path)) ||
                      protectedApiPaths.some(path => pathname.startsWith(path));

  if (requiresAuth && !token) {
    // Redirect to signin for protected pages
    if (!pathname.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // Return 401 for API routes
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Verify token and check admin access
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Check admin access
      const requiresAdmin = adminPaths.some(path => pathname.startsWith(path));
      
      if (requiresAdmin && !decoded.isAdmin) {
        // Redirect non-admin users away from admin pages
        if (!pathname.startsWith('/api')) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }
        
        // Return 403 for API routes
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
      
      // Add user info to headers for API routes
      if (pathname.startsWith('/api')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', decoded.userId.toString());
        requestHeaders.set('x-user-email', decoded.email);
        requestHeaders.set('x-is-admin', decoded.isAdmin ? 'true' : 'false');
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
      
    } catch (error) {
      // Invalid token - clear it and redirect to signin
      if (!pathname.startsWith('/api')) {
        const response = NextResponse.redirect(new URL('/signin', request.url));
        response.cookies.delete('token');
        return response;
      }
      
      // Return 401 for API routes with invalid token
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};