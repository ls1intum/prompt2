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

-- name: GetOwnSeatAssignment :one
SELECT s.seat_name, s.has_mac, s.device_id, s.assigned_student, t.first_name as tutor_first_name, t.last_name as tutor_last_name, t.email as tutor_email
FROM seat s
JOIN tutor t ON s.course_phase_id = t.course_phase_id AND s.assigned_tutor = t.id
WHERE s.course_phase_id = $1
  AND s.assigned_student = $2;