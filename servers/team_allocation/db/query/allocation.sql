-- name: GetAllocationsByCoursePhase :many
SELECT a.*
FROM allocations a
JOIN team t ON a.team_id = t.id
WHERE t.course_phase_id = $1;

-- name: CreateAllocation :exec
INSERT INTO allocations (
    id,
    course_participation_id,
    team_id,
    course_phase_id,
    created_at,
    updated_at
) VALUES (
    $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- name: UpdateAllocation :exec
UPDATE allocations
SET team_id = $2,
    course_phase_id = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE course_participation_id = $1;

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
