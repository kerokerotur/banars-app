-- Users table for LINE-linked accounts

CREATE TABLE IF NOT EXISTS public.user (
  id uuid PRIMARY KEY,
  line_user_id text NOT NULL UNIQUE,
  last_login_datetime timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','blocked')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_user uuid REFERENCES public.user(id),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_user uuid REFERENCES public.user(id)
);

CREATE INDEX IF NOT EXISTS user_status_idx ON public.user (status);

DROP TRIGGER IF EXISTS set_timestamp_user ON public.user;
CREATE TRIGGER set_timestamp_user
BEFORE UPDATE ON public.user
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp();
