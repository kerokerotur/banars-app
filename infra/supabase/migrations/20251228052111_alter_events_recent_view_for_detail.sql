-- events_recent_view: 詳細画面で必要なイベント情報を一覧レスポンスに含めるための拡張
-- 既存ビューを再定義し、場所名・Google Maps 正規化 URL・メモを追加する

DROP VIEW IF EXISTS public.events_recent_view;

CREATE VIEW public.events_recent_view AS
SELECT
  e.id,
  e.title,
  e.event_type_id,
  et.name AS event_type_name,
  e.start_datetime,
  e.meeting_datetime,
  e.response_deadline_datetime,
  e.event_place_id,
  ep.name AS event_place_name,
  ep.google_maps_url_normalized AS event_place_google_maps_url_normalized,
  e.notes_markdown,
  e.created_at,
  e.updated_at
FROM public.events AS e
LEFT JOIN public.event_types AS et ON et.id = e.event_type_id
LEFT JOIN public.event_places AS ep ON ep.id = e.event_place_id
WHERE e.start_datetime >= timezone('utc', now()) - INTERVAL '1 day';
