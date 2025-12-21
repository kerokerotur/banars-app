-- attendance: 出欠レコード
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  member_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('attending', 'not_attending', 'pending')),
  comment text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_user uuid,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_user uuid,
  UNIQUE (event_id, member_id)
);

-- インデックス: イベントごとの出欠一覧取得用
CREATE INDEX attendance_event_id_idx ON public.attendance (event_id);

-- インデックス: メンバーごとの出欠履歴取得用
CREATE INDEX attendance_member_id_idx ON public.attendance (member_id);

-- updated_at自動更新トリガー
CREATE TRIGGER attendance_set_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();
