import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { BufferAuthError } from "#/lib/buffer/auth";
import { bufferAuthClient } from "#/lib/buffer/client";
import { encryptToken } from "#/lib/buffer/crypto";
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

  const cookieStore = await cookies();
  const oathState = cookieStore.get("buffer_oauth_state")?.value;
  const codeVerifier = cookieStore.get("buffer_code_verifier")?.value;

  // these are single-use, clear them on every path out of this handler.
  cookieStore.delete("buffer_oauth_state");
  cookieStore.delete("buffer_code_verifier");

  if (!code) {
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");
    return new NextResponse(JSON.stringify({ error, error_description }), { status: 400 });
  }

  if (!oathState) {
    return new NextResponse(JSON.stringify({ error: "No state in session" }), { status: 400 });
  }

  if (state !== oathState) {
    return new NextResponse(JSON.stringify({ error: "Invalid state" }), { status: 400 });
  }

  // verify the code
  if (!codeVerifier) {
    return new NextResponse(JSON.stringify({ error: "No code verifier in session" }), {
      status: 400,
    });
  }

  // get session token
  const { data: bufferToken, error: exchangeCodeError } = await tryCatch(
    bufferAuthClient.exchangeCode({ code, codeVerifier }),
  );

  if (exchangeCodeError) {
    if (exchangeCodeError instanceof BufferAuthError) {
      return NextResponse.json(
        { error: exchangeCodeError.code, error_description: exchangeCodeError.message },
        { status: exchangeCodeError.status },
      );
    }

    return NextResponse.json({ error: "token_exchange_failed" }, { status: 502 });
  }

  // set the session token, override maxAge with bufferToken.expires_in
  cookieStore.set(
    "buffer_token",
    encryptToken(bufferToken.access_token, process.env.BUFFER_TOKEN_ENCRYPTION_KEY),
    {
      ...COOKIE_OPTIONS,
      maxAge: bufferToken.expires_in,
    },
  );

  if (bufferToken.refresh_token) {
    cookieStore.set(
      "buffer_refresh_token",
      encryptToken(bufferToken.refresh_token, process.env.BUFFER_TOKEN_ENCRYPTION_KEY),
      {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 14,
      },
    );
  }

  // prefer the public domain (e.g. the ngrok URL in dev) over request.url, which can be the internal host behind a proxy or tunnel
  const base = process.env.REDIRECT_URI_DOMAIN
    ? `https://${process.env.REDIRECT_URI_DOMAIN}`
    : request.url;

  return NextResponse.redirect(new URL("/wrapped", base));
}
