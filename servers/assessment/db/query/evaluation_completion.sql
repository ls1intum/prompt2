-- name: CreateOrUpdateEvaluationCompletion :exec
INSERT INTO evaluation_completion (course_participation_id,
                                   course_phase_id,
                                   author_course_participation_id,
                                   completed_at,
                                   completed)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (course_participation_id, course_phase_id, author_course_participation_id)
    DO UPDATE
    SET completed_at = EXCLUDED.completed_at,
        completed    = EXCLUDED.completed;

-- name: MarkEvaluationAsFinished :exec
INSERT INTO evaluation_completion (course_participation_id,
                   course_phase_id,
                   author_course_participation_id,
                   completed_at,
                   completed)
VALUES ($1, $2, $3, $4, true)
ON CONFLICT (course_participation_id, course_phase_id, author_course_participation_id)
  DO UPDATE
  SET completed_at = EXCLUDED.completed_at,
    completed    = true;

-- name: UnmarkEvaluationAsFinished :exec
UPDATE evaluation_completion
SET completed = false
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND author_course_participation_id = $3;

-- name: DeleteEvaluationCompletion :exec
DELETE
FROM evaluation_completion
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND author_course_participation_id = $3;

-- name: GetEvaluationCompletionsByCoursePhase :many
SELECT *
FROM evaluation_completion
WHERE course_phase_id = $1;

-- name: GetEvaluationCompletion :one
SELECT *
FROM evaluation_completion
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND author_course_participation_id = $3;

-- name: CheckEvaluationCompletionExists :one
SELECT EXISTS (SELECT 1
               FROM evaluation_completion
               WHERE course_participation_id = $1
                 AND course_phase_id = $2
                 AND author_course_participation_id = $3);

-- name: GetSelfEvaluationCompletionsByCoursePhase :many
SELECT *
FROM evaluation_completion
WHERE course_phase_id = $1
  AND course_participation_id = author_course_participation_id;

-- name: GetPeerEvaluationCompletionsByCoursePhase :many
SELECT *
FROM evaluation_completion
WHERE course_phase_id = $1
  AND course_participation_id != author_course_participation_id;

-- name: GetEvaluationCompletionsForParticipantInPhase :many
SELECT *
FROM evaluation_completion
WHERE course_participation_id = $1
  AND course_phase_id = $2;

-- name: GetEvaluationCompletionsForAuthorInPhase :many
SELECT *
FROM evaluation_completion
WHERE author_course_participation_id = $1
  AND course_phase_id = $2;

-- name: GetPeerEvaluationCompletionsForParticipantInPhase :many
SELECT *
FROM evaluation_completion
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND course_participation_id != author_course_participation_id;
