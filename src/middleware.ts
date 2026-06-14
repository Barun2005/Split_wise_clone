import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Only protect API routes for now, we can protect pages later
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Attach user id to headers for downstream access
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/groups')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const payload = await verifyJWT(token);
    if (!payload) {
      // Clear cookie and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/groups/:path*'],
};
