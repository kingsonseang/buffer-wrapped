import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get("buffer_token")?.value;
  const hasAccessToken = !!token;

  // no access token on a protected page: try a refresh before giving up.
  // the refresh route sends the user to "/" if there's no refresh token or it fails.
  if (pathname.startsWith("/wrapped") && !hasAccessToken) {
    const refreshUrl = new URL("/api/auth/buffer/refresh", request.url);
    refreshUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(refreshUrl);
  }

  // if trying to access / while already authenticated -> redirect to /wrapped
  if (pathname === "/" && hasAccessToken) {
    return NextResponse.redirect(new URL("/wrapped", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // matches all routes except API routes, static files, and images
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
