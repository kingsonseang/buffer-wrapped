import { generateCodeChallenge, generateCodeVerifier } from "./pkce-code";

const AUTH_URL = "https://auth.buffer.com/auth";
const TOKEN_URL = "https://auth.buffer.com/token";

/** Scopes Buffer currently supports. */
export type BufferScope =
  | "posts:read"
  | "posts:write"
  | "ideas:read"
  | "ideas:write"
  | "account:read"
  | "account:write"
  | "offline_access";

const DEFAULT_SCOPES: BufferScope[] = [
  "posts:read",
  "ideas:read",
  "account:read",
  "offline_access",
];

export interface BufferAuthClientOptions {
  client_id: string;
  client_secret?: string;
  redirect_uri: string;
  scopes?: BufferScope[];
}

export interface BufferTokens {
  access_token: string;
  refresh_token?: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
}

interface BufferAuthorizationRequest {
  url: string;
  state: string;
  codeVerifier: string;
}

export class BufferAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "BufferAuthError";
  }
}

/**
 * OAuth 2.0 Authorization Code + PKCE client for Buffer.
 *
 * The client is stateless: it never stores the verifier, state, or tokens.
 * You persist those yourself (server session / database).
 *
 * Confidential clients (with a secret) must only be used server-side.
 * Never ship `client_secret` to the browser.
 *
 * @see https://developers.buffer.com/guides/authentication.html#oauth
 *
 * @example
 * const auth = new BufferAuthClient({
 *   client_id: process.env.BUFFER_CLIENT_ID!,
 *   client_secret: process.env.BUFFER_CLIENT_SECRET,
 *   redirect_uri: "https://yourapp.com/callback",
 * });
 */
export class BufferAuthClient {
  private readonly client_id: string;
  private readonly client_secret?: string;
  private readonly redirect_uri: string;
  private readonly scopes: BufferScope[];

  constructor(options: BufferAuthClientOptions) {
    this.client_id = options.client_id;
    this.client_secret = options.client_secret;
    this.redirect_uri = options.redirect_uri;
    this.scopes = options.scopes ?? DEFAULT_SCOPES;
  }

  /**
   * Generates the PKCE pair and state, and builds the Buffer
   * authorization URL.
   *
   * @returns The URL to redirect the user to, plus the `state` and
   * `codeVerifier` you must store until the callback.
   */
  async createAuthorizationRequest(): Promise<BufferAuthorizationRequest> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = crypto.randomUUID();

    const params = new URLSearchParams({
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      response_type: "code",
      scope: this.scopes.join(" "),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      prompt: "consent",
    });

    return {
      url: `${AUTH_URL}?${params.toString()}`,
      state,
      codeVerifier,
    };
  }

  /**
   * Exchanges the authorization code for an access token.
   *
   * @param code The authorization code returned from the callback.
   * @returns The access token and refresh token.
   */
  exchangeCode(args: { code: string; codeVerifier: string }): Promise<BufferTokens> {
    return this.requestToken({
      grant_type: "authorization_code",
      code: args.code,
      redirect_uri: this.redirect_uri,
      code_verifier: args.codeVerifier,
    });
  }

  /**
   * Exchanges a refresh token for a new token pair.
   *
   * Refresh tokens are single-use: always persist the new `refresh_token`
   * from the result and discard the old one. Reusing an old one revokes
   * every token for the grant and the user must re-authorize.
   *
   * @param refresh_token - The latest stored refresh token.
   * @throws {BufferAuthError} If Buffer rejects the refresh.
   */
  refreshTokens(refresh_token: string): Promise<BufferTokens> {
    return this.requestToken({
      grant_type: "refresh_token",
      refresh_token,
    });
  }

  /** POSTs to the token endpoint, adding client credentials. */
  private async requestToken(body: Record<string, string>): Promise<BufferTokens> {
    const params = new URLSearchParams({ client_id: this.client_id, ...body });
    if (this.client_secret) params.append("client_secret", this.client_secret);

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await response.json().catch(() => {});

    if (!response.ok) {
      throw new BufferAuthError(
        data.error ?? "unknown_error",
        data.error_description ?? `Token request failed (${response.status})`,
        response.status,
      );
    }

    return data as BufferTokens;
  }
}
