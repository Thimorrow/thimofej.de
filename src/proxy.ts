import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const path = request.nextUrl.pathname;
  const german = path === '/de' || path.startsWith('/de/') || path.startsWith('/lab/') || path === '/projects/academy/demo';
  headers.set('x-site-locale', german ? 'de' : 'en');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/', '/en/:path*', '/de/:path*', '/projects/:path*', '/lab/:path*'],
};
