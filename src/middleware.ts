import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Only protect /prototype routes
  if (!req.nextUrl.pathname.startsWith('/prototype')) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');
  const user = process.env.BASIC_AUTH_USER;
  const pwd = process.env.BASIC_AUTH_PASS;

  // Only enforce if env vars are set
  if (user && pwd) {
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [u, p] = atob(authValue).split(':');

      if (u === user && p === pwd) {
        return NextResponse.next();
      }
    }

    return new NextResponse('Authentication Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/prototype/:path*',
};
