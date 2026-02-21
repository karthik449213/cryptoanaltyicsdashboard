const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

type RequiredKey = (typeof required)[number];

type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  COINGECKO_API_KEY?: string;
};

export function getPublicEnv(): PublicEnv {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
  };

  for (const key of required) {
    if (!env[key as RequiredKey]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return env as PublicEnv;
}

type ServerEnv = {
  SESSION_SECRET: string;
};

export function getServerEnv(): ServerEnv {
  const SESSION_SECRET = process.env.SESSION_SECRET;

  if (!SESSION_SECRET) {
    throw new Error("Missing required environment variable: SESSION_SECRET");
  }

  return { SESSION_SECRET };
}

type AdminEnv = ServerEnv & {
  SUPABASE_SERVICE_ROLE_KEY: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
};

export function getAdminEnv(): AdminEnv {
  const SESSION_SECRET = process.env.SESSION_SECRET;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!SESSION_SECRET) {
    throw new Error("Missing required environment variable: SESSION_SECRET");
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  return { SESSION_SECRET, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL };
}
