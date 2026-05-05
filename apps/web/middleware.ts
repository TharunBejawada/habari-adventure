// apps/web/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './lib/languages';

// The "export" keyword here is what Next.js is looking for!
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Ignore Admin, API, and static files (images, css, etc.)
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Check if the URL already has a valid language code (e.g., /fr/packages)
  const hasLocale = SUPPORTED_LANGUAGES.some(
    (lang) => pathname.startsWith(`/${lang.code}/`) || pathname === `/${lang.code}`
  );

  // 3. If there is no language code, we assume it is the Default Language (English).
  // We rewrite the request so Next.js processes it correctly under the hood.
  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANGUAGE}${pathname}`;
    // return NextResponse.rewrite(url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on public pages
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};