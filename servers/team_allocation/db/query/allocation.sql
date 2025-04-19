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
  $1,
  $2,
  $3,
  $4,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ON CONSTRAINT allocations_participation_phase_uk
  DO UPDATE
SET team_id = EXCLUDED.team_id,
  updated_at = CURRENT_TIMESTAMP;


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
WHERE course_participation_id = $1
  AND course_phase_id = $2;

-- name: GetAggregatedAllocationsByCoursePhase :many
SELECT
    team_id,
    array_agg(course_participation_id ORDER BY course_participation_id)::uuid[] AS student_ids
FROM allocations
WHERE course_phase_id = $1
GROUP BY team_id
ORDER BY team_id;
