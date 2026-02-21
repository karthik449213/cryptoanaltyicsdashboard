import crypto from "crypto";
import { getServerEnv } from "@/lib/env";

let SESSION_SECRET: string | null = null;
function ensureSecret() {
  if (!SESSION_SECRET) {
    try {
      SESSION_SECRET = getServerEnv().SESSION_SECRET;
    } catch (e) {
      // during build or environments without the var, avoid throwing here
      SESSION_SECRET = "";
    }
  }
  return SESSION_SECRET;
}
const COOKIE_NAME = "app_session";

function base64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(payload: string) {
  const secret = ensureSecret();
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionToken(userId: string, expiresInSeconds = 60 * 60 * 24 * 7) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const payload = JSON.stringify({ uid: userId, iat, exp });

  const encoded = base64url(payload);
  const signature = sign(encoded);

  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string) {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;

    const expected = sign(encoded);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    // convert base64url -> base64
    let b64 = String(encoded).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4 !== 0) b64 += "=";
    const payload = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload as { uid: string; iat: number; exp: number };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
