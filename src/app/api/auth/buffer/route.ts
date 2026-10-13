import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { bufferAuthClient } from "#/lib/buffer/client";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth/buffer/callback",
  maxAge: 60 * 10,
  domain: process.env.REDIRECT_URI_DOMAIN,
} as Partial<ResponseCookie>;

export async function GET() {
  const { url, state, codeVerifier } = await bufferAuthClient.createAuthorizationRequest();

  const cookieStore = await cookies();
  cookieStore.set("buffer_oauth_state", state, COOKIE_OPTIONS);
  cookieStore.set("buffer_code_verifier", codeVerifier, COOKIE_OPTIONS);

  return NextResponse.redirect(url);
}
