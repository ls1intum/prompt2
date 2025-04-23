-- name: GetAssignmentsByCoursePhase :many
SELECT a.*
FROM assignments a
WHERE a.course_phase_id = $1;

-- name: CreateOrUpdateAssignment :exec
INSERT INTO assignments AS a (
  id,
  course_participation_id,
  student_full_name,
  team_id,
  course_phase_id,
  created_at,
  updated_at
) VALUES (
  $1,
  $2,
  $3,
  $4,
  $5,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ON CONSTRAINT assignments_participation_phase_uk
  DO UPDATE
SET team_id = EXCLUDED.team_id,
  updated_at = CURRENT_TIMESTAMP;

-- name: GetAssignmentForStudent :one
SELECT
    id,
    course_participation_id,
    team_id,
    course_phase_id,
    created_at,
    updated_at
FROM assignments
WHERE course_participation_id = $1
  AND course_phase_id = $2;

-- name: GetAggregatedAssignmentsByCoursePhase :many
SELECT
    team_id,
    array_agg(student_full_name)::text[] AS student_names
FROM assignments
WHERE course_phase_id = $1
GROUP BY team_id
ORDER BY team_id;
