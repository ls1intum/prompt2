-- Returns all assessments for a given assessee (student) ordered by assessment date.
-- name: GetAssessmentsForAssessee :many
SELECT id, assessor_id, assessee_id, competency_id, score, comment, assessed_at
FROM assessment
WHERE assessee_id = $1
ORDER BY assessed_at DESC;

-- Returns an assessment for a given assessee on a specific competency.
-- name: GetAssessmentByCompetencyAndAssessee :one
SELECT id, assessor_id, assessee_id, competency_id, score, comment, assessed_at
FROM assessment
WHERE assessee_id = $1
  AND competency_id = $2;

-- Inserts a new assessment.
-- name: InsertAssessment :exec
INSERT INTO assessment (id, assessor_id, assessee_id, competency_id, score, comment, assessed_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- Updates an existing assessment.
-- name: UpdateAssessment :exec
UPDATE assessment
SET score = $2,
    comment = $3,
    assessed_at = $4
WHERE id = $1;

-- Deletes an assessment by its id.
-- name: DeleteAssessment :exec
DELETE FROM assessment
WHERE id = $1;