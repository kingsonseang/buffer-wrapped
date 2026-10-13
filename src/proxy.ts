import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("buffer_token")?.value;
  const isAuthenticated = !!token;

  // if trying to access /wrapped without being authenticated -> redirect to /
  if (pathname.startsWith("/wrapped") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // if trying to access / while already authenticated -> redirect to /wrapped
  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/wrapped", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // matches all routes except API routes, static files, and images
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
