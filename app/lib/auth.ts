import crypto from "crypto";

const COOKIE_NAME = "cg_session";

function b64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function b64urlJson(obj: any) {
  return b64url(JSON.stringify(obj));
}

function sign(data: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(payload: { email: string; role: string }, maxAgeSeconds = 60 * 60 * 8) {
  const secret = process.env.AUTH_SECRET || "";
  if (!secret) throw new Error("AUTH_SECRET não definido no .env");

  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;

  const body = {
    ...payload,
    exp,
  };

  const encoded = b64urlJson(body);
  const sig = sign(encoded, secret);
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;

  const secret = process.env.AUTH_SECRET || "";
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encoded, sig] = parts;
  const expected = sign(encoded, secret);

  // comparação “safe”
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    const now = Math.floor(Date.now() / 1000);

    if (!payload?.exp || now > payload.exp) return null;

    return payload as { email: string; role: string; exp: number };
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
