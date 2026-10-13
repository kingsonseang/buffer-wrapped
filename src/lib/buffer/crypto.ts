import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // recommended nonce size for GCM
const VERSION = "v1"; // lets you change the format or rotate keys later

let cachedKey: Buffer | undefined;

/**
 * Reads and validates BUFFER_TOKEN_ENCRYPTION_KEY (base64, 32 bytes).
 * Read lazily so a missing var doesn't fail the build, only the first use.
 */
function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.BUFFER_TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("BUFFER_TOKEN_ENCRYPTION_KEY is not set");
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("BUFFER_TOKEN_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  }

  cachedKey = key;
  return key;
}

/**
 * Encrypts a token for storage (e.g. in a cookie).
 *
 * Output format: `v1.<iv>.<authTag>.<ciphertext>`, each part base64url.
 *
 * @param token - The plaintext token.
 * @param context - Optional string bound to the ciphertext (e.g. the cookie
 * name). Decryption fails unless the same value is passed, so one cookie's
 * value can't be swapped into another.
 */
export function encryptToken(token: string, context?: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  if (context) cipher.setAAD(Buffer.from(context));

  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [VERSION, iv, tag, ciphertext]
    .map((p) => (typeof p === "string" ? p : p.toString("base64url")))
    .join(".");
}

/**
 * Decrypts a value produced by {@link encryptToken}.
 *
 * @param value - The stored string.
 * @param context - Must match what was passed to `encryptToken`.
 * @throws If the value is malformed, tampered with, encrypted with a
 * different key, or the context doesn't match. Treat that as "not logged in".
 */
export function decryptToken(value: string, context?: string): string {
  const [version, iv, tag, ciphertext] = value.split(".");
  if (version !== VERSION || !iv || !tag || !ciphertext) {
    throw new Error("Invalid encrypted token format");
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(iv, "base64url"));
  if (context) decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
