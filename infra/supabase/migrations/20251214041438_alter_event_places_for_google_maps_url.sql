-- event_placesテーブルの構造を変更
-- OSM関連カラムを削除し、Google Maps共有URLベースの設計に変更

-- 1. 既存のUNIQUEインデックスを削除
DROP INDEX IF EXISTS public.event_places_osm_unique_idx;
DROP INDEX IF EXISTS public.event_places_fingerprint_unique_idx;

-- 2. google_maps_urlカラムを追加（一時的にNULLABLE）
ALTER TABLE public.event_places
  ADD COLUMN google_maps_url text;

-- 3. google_maps_urlをNOT NULLに変更
ALTER TABLE public.event_places
  ALTER COLUMN google_maps_url SET NOT NULL;

-- 4. addressをNULLABLEに変更してから削除
ALTER TABLE public.event_places
  ALTER COLUMN address DROP NOT NULL;

-- 5. 不要なカラムを削除
ALTER TABLE public.event_places
  DROP COLUMN address,
  DROP COLUMN latitude,
  DROP COLUMN longitude,
  DROP COLUMN osm_id,
  DROP COLUMN osm_type,
  DROP COLUMN place_fingerprint;

-- 6. 場所名のUNIQUEインデックスを追加
CREATE UNIQUE INDEX event_places_name_idx
  ON public.event_places (name);
