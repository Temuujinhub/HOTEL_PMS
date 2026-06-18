import { NextResponse, type NextRequest } from 'next/server';

// Per-hotel booking sites live on subdomains, e.g. grand-aurora.mastrsys.com,
// and are internally served by the /h/[slug] routes. This middleware rewrites
// a hotel subdomain to that path. The apex (mastrsys.com) and reserved
// subdomains serve the marketing site / dashboard unchanged. Path-based access
// (/h/{slug}) also works directly, so it functions on a bare IP before DNS.

const ROOT_DOMAIN = 'mastrsys.com';
const RESERVED = new Set(['www', 'app', 'api', 'admin', 'mail', 'dashboard']);

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const { pathname } = req.nextUrl;

  if (!host.endsWith(`.${ROOT_DOMAIN}`)) return NextResponse.next();
  const sub = host.slice(0, host.length - ROOT_DOMAIN.length - 1);
  if (!sub || sub.includes('.') || RESERVED.has(sub)) return NextResponse.next();
  if (pathname.startsWith('/h/')) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/h/${sub}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, the API, and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
