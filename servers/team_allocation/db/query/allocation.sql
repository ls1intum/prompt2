-- name: GetAllocationsByCoursePhase :many
SELECT *
FROM allocations
WHERE course_phase_id = $1;

-- name: GetAllocationForStudent :one
SELECT *
FROM allocations
WHERE course_participation_id = $1
AND course_phase_id = $2;

-- name: CreateAllocation :exec
INSERT INTO allocations (id, course_participation_id, team_id, course_phase_id)
VALUES ($1, $2, $3, $4);

-- name: UpdateAllocation :exec
UPDATE allocations
SET team_id = $3
WHERE id = $1
AND course_phase_id = $2;

-- name: DeleteAllocation :exec
DELETE FROM allocations
WHERE id = $1
AND course_phase_id = $2;

-- name: DeleteAllocationsByPhase :exec
DELETE FROM allocations
WHERE course_phase_id = $1;
