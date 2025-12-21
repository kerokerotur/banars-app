CREATE VIEW events_recent_view AS
SELECT
  e.id,
  e.title,
  e.event_type_id,
  et.name AS event_type_name,
  e.start_datetime,
  e.meeting_datetime,
  e.response_deadline_datetime,
  e.event_place_id,
  ep.name AS place_name,
  e.created_at,
  e.updated_at
FROM events e
LEFT JOIN event_types et ON et.id = e.event_type_id
LEFT JOIN event_places ep ON ep.id = e.event_place_id
WHERE e.start_datetime >= timezone('utc', now()) - INTERVAL '1 day';
