-- name: GetAllocationsByCoursePhase :many
SELECT a.*
FROM allocations a
JOIN team t ON a.team_id = t.id
WHERE t.course_phase_id = $1;

-- name: CreateOrUpdateAllocation :exec
INSERT INTO allocations AS a (
id,
course_participation_id,
team_id,
course_phase_id,
created_at,
updated_at
) VALUES (
$1, -- id to use on first insert only
$2, -- course_participation_id
$3, -- team_id
$4, -- course_phase_id
CURRENT_TIMESTAMP, -- created_at (first insert only)
CURRENT_TIMESTAMP -- updated_at
)
ON CONFLICT ON CONSTRAINT allocations_participation_phase_uk
DO UPDATE
SET team_id = EXCLUDED.team_id,
updated_at = CURRENT_TIMESTAMP; -- keep original id & created_at


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
