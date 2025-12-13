-- event_places: 会場マスタ
CREATE TABLE public.event_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude double precision,
  longitude double precision,
  osm_id bigint,
  osm_type text,
  place_fingerprint text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_user uuid,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_user uuid
);

-- UNIQUE制約: Nominatim検索結果の重複排除
CREATE UNIQUE INDEX event_places_osm_unique_idx
  ON public.event_places (osm_type, osm_id)
  WHERE osm_id IS NOT NULL;

-- UNIQUE制約: 手入力の重複排除
CREATE UNIQUE INDEX event_places_fingerprint_unique_idx
  ON public.event_places (place_fingerprint)
  WHERE place_fingerprint IS NOT NULL;

-- updated_at自動更新トリガー
CREATE TRIGGER event_places_set_updated_at
  BEFORE UPDATE ON public.event_places
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();
