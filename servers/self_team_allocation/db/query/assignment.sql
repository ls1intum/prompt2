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


-- name: DeleteAssignment :exec
DELETE FROM assignments
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND team_id = $3;