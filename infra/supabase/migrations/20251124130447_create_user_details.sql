-- User profile details table

CREATE TABLE IF NOT EXISTS public.user_detail (
  user_id uuid PRIMARY KEY REFERENCES public.user(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 120),
  avatar_url text,
  synced_datetime timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_user uuid REFERENCES public.user(id),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_user uuid REFERENCES public.user(id)
);

DROP TRIGGER IF EXISTS set_timestamp_user_detail ON public.user_detail;
CREATE TRIGGER set_timestamp_user_detail
BEFORE UPDATE ON public.user_detail
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp();
