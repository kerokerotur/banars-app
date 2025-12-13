-- events: イベント本体
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_type_id uuid NOT NULL,
  start_datetime timestamptz,
  meeting_datetime timestamptz,
  response_deadline_datetime timestamptz,
  notes_markdown text,
  event_place_id uuid,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_user uuid,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_user uuid
);

-- インデックス: 最新イベント一覧向け
CREATE INDEX events_start_datetime_idx ON public.events (start_datetime DESC);

-- インデックス: リマインドジョブ抽出用
CREATE INDEX events_response_deadline_idx ON public.events (response_deadline_datetime);

-- updated_at自動更新トリガー
CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();
