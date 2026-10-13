import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { bufferAuthClient } from "#/lib/buffer/client";
// import { clearAuthState } from "#/lib/session";
import { tryCatch } from "#/lib/tryCatch";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 10,
  domain: process.env.REDIRECT_URI_DOMAIN,
} as Partial<ResponseCookie>;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");
    // await clearAuthState();
    return new NextResponse(JSON.stringify({ error, error_description }), { status: 400 });
  }

  const cookieStore = await cookies();
  const oathState = cookieStore.get("buffer_oauth_state")?.value;

  console.log("all cookies", cookieStore.getAll());

  if (!oathState) {
    // clear auth state cookie
    // await clearAuthState();
    return new NextResponse(JSON.stringify({ error: "No state in session" }), { status: 400 });
  }

  if (state !== oathState) {
    // clear auth state cookie
    // await clearAuthState();
    return new NextResponse(JSON.stringify({ error: "Invalid state" }), { status: 400 });
  }

  // verify the code
  const codeVerifier = cookieStore.get("buffer_code_verifier")?.value;
  if (!codeVerifier) {
    // clear auth state cookie
    // await clearAuthState();
    return new NextResponse(JSON.stringify({ error: "No code verifier in session" }), {
      status: 400,
    });
  }

  // get session token
  const { data: bufferToken, error: exchangeCodeError } = await tryCatch(
    bufferAuthClient.exchangeCode({ code, codeVerifier }),
  );

  console.log("bufferExchangeError", exchangeCodeError);

  if (exchangeCodeError) {
    return new NextResponse(JSON.stringify({ error: exchangeCodeError }), { status: 500 });
  }

  // set the session token, override maxAge with bufferToken.expires_in
  cookieStore.set("buffer_token", bufferToken.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: bufferToken.expires_in,
  });
  if (bufferToken.refresh_token) {
    cookieStore.set("buffer_refresh_token", bufferToken.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: bufferToken.expires_in,
    });
  }

  // clear auth state cookie
  // await clearAuthState();

  // use REDIRECT_URI_DOMAIN from env var to redirect to wrapped rather than request.url
  return NextResponse.redirect(new URL("/wrapped", process.env.REDIRECT_URI_DOMAIN!));
  // return NextResponse.redirect(new URL("/wrapped", request.url));
}
