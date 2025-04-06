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
UPDATE assessment
SET
  score = $4,
  comment = $5,
  assessed_at = $6,
  author = $7
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND competency_id = $3
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

-- name: CountRemainingAssessmentsForStudent :one
SELECT
  COUNT(*) - (
    SELECT COUNT(*)
    FROM assessment
    WHERE course_participation_id = $1
      AND course_phase_id = $2
  ) AS remaining_assessments
FROM competency;

-- name: CountRemainingAssessmentsPerCategory :many
SELECT
  c.category_id,
  COUNT(*) - (
    SELECT COUNT(*)
    FROM assessment a
    WHERE a.course_participation_id = $1
      AND a.course_phase_id = $2
      AND a.competency_id IN (
        SELECT id FROM competency WHERE competency.category_id = c.category_id
      )
  ) AS remaining_assessments
FROM competency c
GROUP BY c.category_id;