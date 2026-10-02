import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.RESEND_API_KEY;
  if (!value) throw new Error("Missing unsubscribe signing secret.");
  return value;
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createUnsubscribeToken(email: string) {
  const payload = encode(email.trim().toLowerCase());
  return `${payload}.${signature(payload)}`;
}

export function verifyUnsubscribeToken(token: string) {
  const [payload, providedSignature] = token.split(".");
  if (!payload || !providedSignature) return null;

  const expectedSignature = signature(payload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  const email = decode(payload);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function getUnsubscribeUrl(email: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://clonao.com").replace(/\/$/, "");
  return `${siteUrl}/api/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(email))}`;
}
