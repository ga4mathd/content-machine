import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'cm-session';

// Lightweight session check for Edge Runtime middleware
// Full verification happens in auth.ts (Node.js runtime)
function quickVerifyToken(token: string): { role: string } | null {
  try {
    const [payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const payloadStr = atob(payloadB64);
    const payload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) return null;
    return { role: payload.role };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth needed
  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const session = quickVerifyToken(token);
  if (!session) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // Admin routes - admin only
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/team', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
