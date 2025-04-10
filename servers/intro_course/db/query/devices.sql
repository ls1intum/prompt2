-- name: GetDevicesForCourseParticipation :one
SELECT array_remove(
  ARRAY[
    CASE WHEN has_macbook       THEN 'Mac' END,
    CASE WHEN iphone_udid       IS NOT NULL THEN 'IPhone' END,
    CASE WHEN ipad_udid         IS NOT NULL THEN 'IPad' END,
    CASE WHEN apple_watch_udid  IS NOT NULL THEN 'Watch' END
  ]::text[],
  NULL
)::text[] AS devices
FROM developer_profile
WHERE course_phase_id = $1
  AND course_participation_id = $2;

-- name: GetDevicesForCoursePhase :many
SELECT course_participation_id, array_remove(
  ARRAY[
    CASE WHEN has_macbook       THEN 'Mac' END,
    CASE WHEN iphone_udid       IS NOT NULL   THEN 'IPhone' END,
    CASE WHEN ipad_udid         IS NOT NULL   THEN 'IPad' END,
    CASE WHEN apple_watch_udid  IS NOT NULL   THEN 'Watch' END
  ]::text[],
  NULL
)::text[] AS devices
FROM developer_profile
WHERE course_phase_id = $1;


