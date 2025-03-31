-- name: GetAssessmentsForStudentInPhase :many
SELECT id, course_participation_id, course_phase_id, competency_id, score, comment, assessed_at
FROM assessment
WHERE course_participation_id = $1
  AND course_phase_id = $2
ORDER BY assessed_at DESC;

-- name: GetAssessmentByCompetency :one
SELECT id, course_participation_id, course_phase_id, competency_id, score, comment, assessed_at
FROM assessment
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND competency_id = $3;

-- name: InsertAssessment :exec
INSERT INTO assessment (id, course_participation_id, course_phase_id, competency_id, score, comment, assessed_at)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: UpdateAssessment :exec
UPDATE assessment
SET score = $4,
    comment = $5,
    assessed_at = $6
WHERE id = $1
  AND course_participation_id = $2
  AND course_phase_id = $3;

-- name: DeleteAssessment :exec
DELETE FROM assessment
WHERE id = $1
  AND course_participation_id = $2
  AND course_phase_id = $3;