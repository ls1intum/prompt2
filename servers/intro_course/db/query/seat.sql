-- name: CreateSeatPlan :exec
INSERT INTO seat (course_phase_id, seat_name)
SELECT $1, s
FROM unnest(sqlc.arg(seats)::text[]) AS s;

-- name: GetSeatPlan :many
SELECT *
FROM seat
WHERE course_phase_id = $1
ORDER BY seat_name;

-- name: UpdateSeat :exec
UPDATE seat
SET has_mac = $3,
    device_id = $4,
    assigned_student = $5,
    assigned_tutor = $6
WHERE course_phase_id = $1
  AND seat_name = $2;

-- name: DeleteSeatPlan :exec
DELETE FROM seat
WHERE course_phase_id = $1;

-- name: GetAssignedTutor :one
SELECT s.assigned_tutor, t.gitlab_username
FROM seat s
JOIN tutor t ON s.assigned_tutor = t.id AND s.course_phase_id = t.course_phase_id
WHERE s.course_phase_id = $1
  AND s.assigned_student = $2;