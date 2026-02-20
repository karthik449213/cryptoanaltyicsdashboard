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
