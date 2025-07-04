-- name: CreateOrUpdateEvaluation :exec
INSERT INTO evaluation (course_participation_id,
                        course_phase_id,
                        competency_id,
                        score_level,
                        author_course_participation_id)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (course_participation_id, course_phase_id, competency_id, author_course_participation_id)
    DO UPDATE SET score_level  = EXCLUDED.score_level,
                  evaluated_at = CURRENT_TIMESTAMP;

-- name: DeleteEvaluation :exec
DELETE
FROM evaluation
WHERE id = $1;

-- name: GetEvaluationsByPhase :many
SELECT *
FROM evaluation
WHERE course_phase_id = $1;

-- name: GetSelfEvaluationsByPhase :many
SELECT *
FROM evaluation
WHERE course_phase_id = $1
  AND course_participation_id = author_course_participation_id;

-- name: GetSelfEvaluationsForParticipantInPhase :many
SELECT *
FROM evaluation
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND course_participation_id = author_course_participation_id;

-- name: GetPeerEvaluationsByPhase :many
SELECT *
FROM evaluation
WHERE course_phase_id = $1
  AND course_participation_id != author_course_participation_id;

-- name: GetPeerEvaluationsForParticipantInPhase :many
SELECT *
FROM evaluation
WHERE course_participation_id = $1
  AND course_phase_id = $2
  AND course_participation_id != author_course_participation_id;

-- name: GetEvaluationsForAuthorInPhase :many
SELECT *
FROM evaluation
WHERE author_course_participation_id = $1
  AND course_phase_id = $2;

-- name: GetEvaluationByID :one
SELECT *
FROM evaluation
WHERE id = $1;
