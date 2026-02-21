import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth/session";

export type EmailPasswordCredentials = {
  email: string;
  password: string;
};

export type AppUser = {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  // Read our custom session cookie and resolve user from DB
  const cookieStore = (await cookies()) as any;
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    console.debug("getCurrentUser: no token cookie present");
    return null;
  }

  console.debug("getCurrentUser: token (truncated)", String(token).slice(0, 16));

  const payload = await (async () => {
    try {
      const { verifySessionToken } = await import("@/lib/auth/session");
      const payload = verifySessionToken(token as string);
      console.debug("getCurrentUser: verified payload", payload);
      return payload;
    } catch {
      return null;
    }
  })();

  if (!payload) {
    console.debug("getCurrentUser: token failed verification");
    return null;
  }
  if (!payload.uid) {
    console.error("getCurrentUser: Invalid session payload (missing uid)", payload);
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("app_users").select("*").eq("id", payload.uid).maybeSingle();
  console.debug("getCurrentUser: db result", { data, error });
  if (error) {
    console.error("DB error fetching user:", error.message ?? error);
    return null;
  }
  if (!data) {
    console.debug("getCurrentUser: no user found for uid", payload.uid);
    return null;
  }
  return data as AppUser | null;
}

export async function signUpWithEmailPassword({
  email,
  password,
}: EmailPasswordCredentials) {
  const supabase = createSupabaseAdminClient();

  // basic validation
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!normalizedEmail || password.length < 8) {
    throw new Error("Invalid signup input");
  }

  // check existing
  const { data: existing } = await supabase.from("app_users").select("id").eq("email", normalizedEmail).maybeSingle();
  if (existing) {
    throw new Error("An account with this email already exists. Please try logging in instead.");
  }

  // hash password using scrypt
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const hashed = `${salt}:${derived}`;

  const insert = await supabase.from("app_users").insert({ email: normalizedEmail, hashed_password: hashed }).select("id, email").single();
  if (insert.error || !insert.data) {
    console.error("DB insert error:", insert.error);
    throw new Error("Unable to create account. Please check your database connection and try again.");
  }

  const userId = insert.data.id;

  // create session cookie
  const token = createSessionToken(userId);
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const cookieOpts = { name: COOKIE_NAME, value: token, httpOnly: true, path: "/", sameSite: "lax", maxAge } as any;
  if (process.env.NODE_ENV === "production") cookieOpts.secure = true;
  (await cookies() as any).set(cookieOpts);

  return { user: { id: userId, email: insert.data.email }, session: { token } } as any;
}

export async function signInWithEmailPassword({
  email,
  password,
}: EmailPasswordCredentials) {
  const supabase = createSupabaseAdminClient();
  const normalizedEmail = String(email).trim().toLowerCase();

  const { data, error } = await supabase.from("app_users").select("*").eq("email", normalizedEmail).single();
  if (error || !data) {
    throw new Error("Invalid email or password.");
  }

  const [salt, derived] = (data.hashed_password ?? "").split(":");
  if (!salt || !derived) throw new Error("Invalid email or password.");

  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  if (!crypto.timingSafeEqual(Buffer.from(check), Buffer.from(derived))) {
    throw new Error("Invalid email or password.");
  }

  // create session cookie
  const token = createSessionToken(data.id);
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const cookieOpts = { name: COOKIE_NAME, value: token, httpOnly: true, path: "/", sameSite: "lax", maxAge } as any;
  if (process.env.NODE_ENV === "production") cookieOpts.secure = true;
  (await cookies() as any).set(cookieOpts);

  return { user: { id: data.id, email: data.email }, session: { token } } as any;
}

export async function signOutCurrentUser() {
  // clear our session cookie
  (await cookies() as any).set({ name: COOKIE_NAME, value: "", path: "/", httpOnly: true, sameSite: "lax", maxAge: 0 });
}
