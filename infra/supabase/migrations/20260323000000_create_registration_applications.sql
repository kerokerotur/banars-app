-- registration_applications: 登録申請管理
CREATE TABLE public.registration_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_user uuid,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_user uuid,
  CONSTRAINT registration_applications_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- updated_at 自動更新トリガー
CREATE TRIGGER registration_applications_set_updated_at
  BEFORE UPDATE ON public.registration_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- インデックス: pending 申請の取得用
CREATE INDEX registration_applications_status_idx
  ON public.registration_applications (status)
  WHERE status = 'pending';

-- インデックス: LINE ユーザー ID での検索用
CREATE INDEX registration_applications_line_user_id_idx
  ON public.registration_applications (line_user_id);

-- RLS 有効化
ALTER TABLE public.registration_applications ENABLE ROW LEVEL SECURITY;

-- manager ロールのみ操作可能
DROP POLICY IF EXISTS registration_applications_manager_select ON public.registration_applications;
CREATE POLICY registration_applications_manager_select
  ON public.registration_applications
  FOR SELECT
  USING (coalesce(auth.jwt() ->> 'role', '') = 'manager');

DROP POLICY IF EXISTS registration_applications_manager_insert ON public.registration_applications;
CREATE POLICY registration_applications_manager_insert
  ON public.registration_applications
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS registration_applications_manager_update ON public.registration_applications;
CREATE POLICY registration_applications_manager_update
  ON public.registration_applications
  FOR UPDATE
  USING (coalesce(auth.jwt() ->> 'role', '') = 'manager');
