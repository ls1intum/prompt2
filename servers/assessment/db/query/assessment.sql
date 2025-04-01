-- name: CreateAssessment :one
INSERT INTO assessment (
    id, course_participation_id, course_phase_id, competency_id,
    score, comment, assessed_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetAssessment :one
SELECT * FROM assessment WHERE id = $1;

-- name: UpdateAssessment :one
UPDATE assessment
SET score = $4, comment = $5, assessed_at = COALESCE($6, CURRENT_TIMESTAMP)
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND competency_id = $3
RETURNING *;

-- name: DeleteAssessment :exec
DELETE FROM assessment WHERE id = $1;

-- name: ListAssessmentsByCoursePhase :many
SELECT * FROM assessment WHERE course_phase_id = $1;

-- name: ListAssessmentsByStudent :many
SELECT * FROM assessment WHERE course_participation_id = $1;

-- name: ListAssessmentsByStudentInPhase :many
SELECT *
FROM assessment
WHERE course_participation_id = $1
  AND course_phase_id = $2;

-- name: ListAssessmentsByCompetency :many
SELECT * FROM assessment WHERE competency_id = $1;

-- name: ListAssessmentsByCategory :many
SELECT a.*
FROM assessment a
JOIN competency c ON a.competency_id = c.id
WHERE c.category_id = $1;
