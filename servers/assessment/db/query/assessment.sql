-- name: CreateAssessment :exec
INSERT INTO assessment (
    id, course_participation_id, course_phase_id, competency_id,
    score, comment, assessed_at, author
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

-- name: GetAssessment :one
SELECT * FROM assessment WHERE id = $1;

-- name: UpdateAssessment :exec
UPDATE assessment
SET
  score = $4,
  comment = $5,
  assessed_at = $6,
  author = $7
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND competency_id = $3;

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
WITH total_competencies AS (
  SELECT COUNT(*) AS total FROM competency
),
assessed_competencies AS (
  SELECT COUNT(*) AS assessed
  FROM assessment a
  WHERE a.course_participation_id = $1
    AND a.course_phase_id = $2
),
remaining_per_category AS (
  SELECT
    c.category_id,
    COUNT(*) - COUNT(ass.id) AS remaining_assessments
  FROM competency c
  LEFT JOIN assessment ass
    ON ass.competency_id = c.id
    AND ass.course_participation_id = $1
    AND ass.course_phase_id = $2
  GROUP BY c.category_id
)
SELECT
  (SELECT total FROM total_competencies) - (SELECT assessed FROM assessed_competencies) AS remaining_assessments,
  json_agg(json_build_object(
    'categoryID', rpc.category_id,
    'remainingAssessments', rpc.remaining_assessments
  )) AS categories
FROM remaining_per_category rpc;