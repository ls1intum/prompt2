-- name: GetStudentScoreWithLevel :one
SELECT course_participation_id,
       score_numeric,
       score_level
FROM weighted_participant_scores
WHERE course_phase_id = $1
  AND course_participation_id = $2;

-- name: GetScoreLevelByCourseParticipationIDNumeric :one
SELECT COALESCE(score_numeric, 0) AS score_numeric
FROM weighted_participant_scores
WHERE course_phase_id = $1
  AND course_participation_id = $2;

-- name: GetAllScoreLevels :many
SELECT course_participation_id,
       score_level,
       score_numeric
FROM weighted_participant_scores
WHERE course_phase_id = $1;

-- name: GetScoreLevelByCourseParticipationID :one
SELECT score_level
FROM weighted_participant_scores
WHERE course_phase_id = $1
  AND course_participation_id = $2;