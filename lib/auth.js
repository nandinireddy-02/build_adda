import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { query, queryOne } from "./db";

const COOKIE_NAME = "ba_session";
const SESSION_DAYS = 30;

// The browser keeps the raw token. The database keeps only its SHA-256 hash,
// so a leaked database cannot be used to log in as anyone.
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await query("insert into sessions (id, user_id, expires_at) values ($1, $2, $3)", [
    hashToken(token),
    userId,
    expiresAt,
  ]);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await query("delete from sessions where id = $1", [hashToken(token)]);
  }
  cookieStore.delete(COOKIE_NAME);
}

// The logged-in user for this request, or null. Cached so several components
// can call it during one page load with a single database lookup.
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  return queryOne(
    `select u.id, u.name, u.email, u.college, u.year, u.branch, u.skills, u.looking_for, u.bio
       from sessions s
       join users u on u.id = s.user_id
      where s.id = $1 and s.expires_at > now()`,
    [hashToken(token)]
  );
});

// Use at the top of pages that need a login. Sends visitors to the login page
// and brings them back afterwards.
export async function requireUser(returnTo = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

// Only allow redirects to our own pages, never to another site.
export function safeNext(value, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
