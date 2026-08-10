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

  // 2. If the URL explicitly starts with the default language prefix (e.g. /en or
  // /en/about), redirect to the prefix-less URL so /en never shows in the address
  // bar and we avoid duplicate-content URLs for the same page.
  if (pathname === `/${DEFAULT_LANGUAGE}` || pathname.startsWith(`/${DEFAULT_LANGUAGE}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LANGUAGE}`.length) || '/';
    return NextResponse.redirect(url);
  }

  // 3. Check if the URL already has a non-default language code (e.g., /fr/packages)
  const hasLocale = SUPPORTED_LANGUAGES.some(
    (lang) =>
      lang.code !== DEFAULT_LANGUAGE &&
      (pathname.startsWith(`/${lang.code}/`) || pathname === `/${lang.code}`)
  );

  // 4. If there is no language code, we assume it is the Default Language (English).
  // We rewrite the request internally so Next.js serves the [lang]=en route tree,
  // while keeping the visible URL free of the /en prefix.
  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? `/${DEFAULT_LANGUAGE}` : `/${DEFAULT_LANGUAGE}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on public pages
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};