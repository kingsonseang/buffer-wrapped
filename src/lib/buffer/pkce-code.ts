/**
 * Base64url-encodes raw bytes (RFC 4648 §5): standard base64 with `+` → `-`,
 * `/` → `_`, and trailing `=` padding stripped. This is the encoding PKCE
 * requires for both the verifier and the challenge.
 *
 * @param bytes - The raw bytes to encode.
 * @returns The base64url string, without padding.
 */
function base64UrlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Generates a PKCE code verifier (RFC 7636 §4.1).
 *
 * Uses 32 cryptographically secure random bytes, which encode to a
 * 43-character base64url string, the minimum length the spec allows
 * (43-128 characters from the unreserved set `[A-Za-z0-9-._~]`).
 *
 * Keep the result private to the client (e.g. in memory or sessionStorage)
 * until the token exchange; only its hash is sent in the authorization request.
 *
 * @returns A high-entropy, URL-safe code verifier.
 *
 * @example
 * const codeVerifier = generateCodeVerifier();
 * const codeChallenge = await generateCodeChallenge(codeVerifier);
 */
export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/**
 * Derives the PKCE code challenge from a verifier using the `S256` method
 * (RFC 7636 §4.2): `BASE64URL(SHA-256(ASCII(code_verifier)))`.
 *
 * Send this with `code_challenge_method=S256` in the authorization request,
 * then send the original verifier when exchanging the code for tokens.
 *
 * @param verifier - The code verifier from {@link generateCodeVerifier}.
 * @returns A promise resolving to the base64url-encoded SHA-256 challenge.
 *
 * @example
 * const codeVerifier = generateCodeVerifier();
 * const codeChallenge = await generateCodeChallenge(codeVerifier);
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}
