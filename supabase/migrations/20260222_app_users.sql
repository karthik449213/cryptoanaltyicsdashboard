-- Create application users table for custom auth
CREATE TABLE IF NOT EXISTS public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  hashed_password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(email);

CREATE OR REPLACE FUNCTION public.update_app_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_app_users_updated_at ON public.app_users;
CREATE TRIGGER trigger_update_app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_app_users_updated_at();

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_users_select_own"
ON public.app_users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "app_users_update_own"
ON public.app_users
FOR UPDATE
USING (auth.uid() = id);

-- Allow unauthenticated inserts for signup flow (server will insert new users)
CREATE POLICY "app_users_insert_open"
ON public.app_users
FOR INSERT
WITH CHECK (true);
