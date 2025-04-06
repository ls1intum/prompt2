-- name: CreateAssessment :one
INSERT INTO assessment (
    id, course_participation_id, course_phase_id, competency_id,
    score, comment, assessed_at, author
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetAssessment :one
SELECT * FROM assessment WHERE id = $1;

-- name: UpdateAssessment :one
INSERT INTO assessment (
  course_participation_id, course_phase_id, competency_id,
  score, comment, assessed_at, author
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (course_participation_id, course_phase_id, competency_id)
DO UPDATE SET
  score = EXCLUDED.score,
  comment = EXCLUDED.comment,
  assessed_at = EXCLUDED.assessed_at,
  author = EXCLUDED.author
RETURNING *;

-- name: DeleteAssessment :exec
DELETE FROM assessment WHERE id = $1;

-- name: ListAssessmentsByCoursePhase :many
SELECT * FROM assessment WHERE course_phase_id = $1;

-- name: ListAssessmentsByStudentInPhase :many
SELECT *
FROM assessment
WHERE course_participation_id = $1
  AND course_phase_id = $2;

-- name: ListAssessmentsByCompetencyInPhase :many
SELECT * 
FROM assessment 
WHERE competency_id = $1 
  AND course_phase_id = $2;

-- name: ListAssessmentsByCategoryInPhase :many
SELECT a.*
FROM assessment a
JOIN competency c ON a.competency_id = c.id
WHERE c.category_id = $1
  AND a.course_phase_id = $2;