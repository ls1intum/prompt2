-- name: GetAllDeveloperProfiles :many
SELECT * 
FROM developer_profile
WHERE course_phase_id = $1;

-- name: GetDeveloperProfileByCourseParticipationID :one
SELECT *
FROM developer_profile
WHERE course_participation_id = $1 
AND course_phase_id = $2;

-- name: CreateDeveloperProfile :exec
INSERT INTO developer_profile (course_participation_id, course_phase_id, gitlab_username, apple_id, has_macbook, iphone_uuid, ipad_uuid, apple_watch_uuid)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8);


-- name: CreateOrUpdateDeveloperProfile :exec
INSERT INTO developer_profile (
  course_participation_id,
  course_phase_id,
  gitlab_username,
  apple_id,
  has_macbook,
  iphone_uuid,
  ipad_uuid,
  apple_watch_uuid
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (course_phase_id, course_participation_id)
DO UPDATE SET 
  gitlab_username   = EXCLUDED.gitlab_username,
  apple_id          = EXCLUDED.apple_id,
  has_macbook       = EXCLUDED.has_macbook,
  iphone_uuid       = EXCLUDED.iphone_uuid,
  ipad_uuid         = EXCLUDED.ipad_uuid,
  apple_watch_uuid  = EXCLUDED.apple_watch_uuid;