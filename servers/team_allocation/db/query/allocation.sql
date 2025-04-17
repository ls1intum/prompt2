-- name: GetAllocationsByCoursePhase :many
SELECT a.*
FROM allocations a
JOIN team t ON a.team_id = t.id
WHERE t.course_phase_id = $1;

-- name: CreateOrUpdateAllocation :exec
INSERT INTO allocations (id, course_participation_id, team_id)
VALUES ($1, $2, $3)
ON CONFLICT (course_participation_id) DO UPDATE
SET team_id = EXCLUDED.team_id;

-- name: DeleteAllocationsByPhase :exec
DELETE FROM allocations a
USING team t
WHERE a.team_id = t.id
AND t.course_phase_id = $1;

-- name: GetAllocationForStudent :one
SELECT id, course_participation_id, team_id, created_at
FROM allocations
WHERE course_participation_id = $1;
