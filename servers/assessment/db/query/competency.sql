-- name: GetRootCompetencies :many
SELECT id, super_competency_id, name, description
FROM competency
WHERE super_competency_id IS NULL;

-- name: GetSubCompetencies :many
SELECT id, super_competency_id, name, description
FROM competency
WHERE super_competency_id = $1;

-- name: GetCompetencyByID :one
SELECT id, super_competency_id, name, description
FROM competency
WHERE id = $1;

-- name: InsertCompetency :exec
INSERT INTO competency (id, super_competency_id, name, description)
VALUES ($1, $2, $3, $4);

-- name: UpdateAssessment :exec
UPDATE assessment
SET score = $4,
    comment = $5,
    assessed_at = $6
WHERE id = $1
  AND course_participation_id = $2
  AND course_phase_id = $3;

-- name: DeleteCompetency :exec
DELETE FROM competency
WHERE id = $1;