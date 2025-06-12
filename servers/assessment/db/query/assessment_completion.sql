-- name: MarkAssessmentAsFinished :exec
INSERT INTO assessment_completion (
    course_participation_id,
    course_phase_id,
    completed_at,
    author
  )
VALUES ($1, $2, $3, $4);

-- name: UnmarkAssessmentAsFinished :exec
DELETE FROM assessment_completion
WHERE course_participation_id = $1
  AND course_phase_id = $2;

-- name: GetAssessmentCompletionsByCoursePhase :many
SELECT *
FROM assessment_completion
WHERE course_phase_id = $1;

-- name: GetAssessmentCompletion :one
SELECT course_participation_id,
  course_phase_id,
  completed_at,
  author
FROM assessment_completion
WHERE course_participation_id = $1
  AND course_phase_id = $2;

-- name: CheckAssessmentCompletionExists :one
SELECT EXISTS (
    SELECT 1
    FROM assessment_completion
    WHERE course_participation_id = $1
      AND course_phase_id = $2
  );