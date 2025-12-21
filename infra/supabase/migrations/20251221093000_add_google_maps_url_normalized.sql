-- イベント会場のGoogle Maps URLを正規化カラムに置き換える

-- 1. 新カラム追加（いったんNULL許容）
ALTER TABLE public.event_places
  ADD COLUMN google_maps_url_normalized text;

-- 2. 既存データを旧カラムからコピー（簡易バックフィル）
UPDATE public.event_places
  SET google_maps_url_normalized = google_maps_url;

-- 3. NOT NULL 制約を設定
ALTER TABLE public.event_places
  ALTER COLUMN google_maps_url_normalized SET NOT NULL;

-- 4. 正規化URLの一意制約用インデックスを追加
CREATE UNIQUE INDEX event_places_google_maps_url_norm_idx
  ON public.event_places (google_maps_url_normalized);

-- 5. 旧カラムを削除
ALTER TABLE public.event_places
  DROP COLUMN google_maps_url;
