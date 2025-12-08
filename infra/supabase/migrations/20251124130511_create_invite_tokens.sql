-- Invite tokens for onboarding

CREATE TABLE IF NOT EXISTS public.invite_token (
  token_hash text PRIMARY KEY CHECK (char_length(token_hash) >= 32),
  expires_datetime timestamptz NOT NULL,
  issued_by uuid NOT NULL REFERENCES public.user(id),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_user uuid REFERENCES public.user(id),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_user uuid REFERENCES public.user(id)
);

CREATE INDEX IF NOT EXISTS invite_token_expires_idx
  ON public.invite_token (expires_datetime DESC);

ALTER TABLE public.invite_token ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invite_token_manager_select ON public.invite_token;
CREATE POLICY invite_token_manager_select
  ON public.invite_token
  FOR SELECT
  USING (coalesce(auth.jwt()->> 'role', '') = 'manager');

DROP POLICY IF EXISTS invite_token_manager_insert ON public.invite_token;
CREATE POLICY invite_token_manager_insert
  ON public.invite_token
  FOR INSERT
  WITH CHECK (coalesce(auth.jwt()->> 'role', '') = 'manager');
