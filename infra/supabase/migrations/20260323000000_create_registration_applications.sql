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

-- manager ロールのみ参照可能
CREATE POLICY "managers can select registration_applications"
  ON public.registration_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."user" u
      JOIN public.user_detail ud ON u.id = ud.user_id
      WHERE u.id = auth.uid()
        AND (
          SELECT role FROM public.user_list_view WHERE id = auth.uid()
        ) = 'manager'
    )
  );
