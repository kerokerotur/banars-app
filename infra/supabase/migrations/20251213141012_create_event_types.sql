-- event_types: イベント種別マスタ
CREATE TABLE public.event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_user uuid,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_user uuid
);

-- インデックス: display_orderでソート
CREATE INDEX event_types_display_order_idx ON public.event_types (display_order);

-- updated_at自動更新トリガー
CREATE TRIGGER event_types_set_updated_at
  BEFORE UPDATE ON public.event_types
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();
