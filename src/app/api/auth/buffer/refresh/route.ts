import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { bufferAuthClient } from "#/lib/buffer/client";
import { decryptToken, encryptToken } from "#/lib/buffer/crypto";
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
  const cookieStore = await cookies();

  // prefer the public domain (e.g. the ngrok URL in dev) over request.url, which can be the internal host behind a proxy or tunnel
  const base = process.env.REDIRECT_URI_DOMAIN
    ? `https://${process.env.REDIRECT_URI_DOMAIN}`
    : request.url;

  const failed = (_e?: Error | null) => {
    cookieStore.delete("buffer_token");
    cookieStore.delete("buffer_refresh_token");
    // return NextResponse.json({ error: e?.message ?? "Failed to refresh token" }, { status: 500 });
    return new URL("/", base);
  };

  const refresh_token = cookieStore.get("buffer_refresh_token")?.value;

  const { data: refreshToken, error: decryptError } = await tryCatch(() =>
    decryptToken(refresh_token!, process.env.BUFFER_TOKEN_ENCRYPTION_KEY),
  );

  if (!refreshToken) return failed(decryptError);

  const { data: bufferToken, error } = await tryCatch(bufferAuthClient.refreshTokens(refreshToken));

  if (error) return failed(error);

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

  return NextResponse.redirect(new URL("/wrapped", base));
}
