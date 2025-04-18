-- name: GetAllocationsByCoursePhase :many
SELECT a.*
FROM allocations a
JOIN team t ON a.team_id = t.id
WHERE t.course_phase_id = $1;

-- name: CreateOrUpdateAllocation :exec
WITH deleted AS (
    DELETE FROM allocations
    WHERE course_participation_id = $2
      AND course_phase_id = $4
    RETURNING created_at
)
INSERT INTO allocations (
    id,
    course_participation_id,
    team_id,
    course_phase_id,
    created_at,
    updated_at
)
SELECT
    $1, $2, $3, $4,
    COALESCE((SELECT created_at FROM deleted), CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP;


-- name: DeleteAllocationsByPhase :exec
DELETE FROM allocations a
USING team t
WHERE a.team_id = t.id
  AND t.course_phase_id = $1;

-- name: GetAllocationForStudent :one
SELECT
    id,
    course_participation_id,
    team_id,
    course_phase_id,
    created_at,
    updated_at
FROM allocations
WHERE course_participation_id = $1;

-- name: GetStudentsForTeam :many
SELECT course_participation_id
FROM allocations
WHERE team_id = $1;
