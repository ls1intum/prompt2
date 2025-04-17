-- name: GetAllScoreLevelsNumeric :many
SELECT course_participation_id, score_numeric
FROM weighted_participant_scores
WHERE course_phase_id = $1;

-- name: GetScoreLevelByCourseParticipationIDNumeric :one
SELECT score_numeric
FROM weighted_participant_scores
WHERE course_phase_id = $1 AND course_participation_id = $2;

-- name: GetAllScoreLevels :many
SELECT
    course_participation_id,
    CASE
        WHEN score_numeric < 1.5 THEN 'novice'
        WHEN score_numeric < 2.5 THEN 'intermediate'
        WHEN score_numeric < 3.5 THEN 'advanced'
        ELSE 'expert'
    END AS score_level
FROM weighted_participant_scores
WHERE course_phase_id = $1;

-- name: GetScoreLevelByCourseParticipationID :one
SELECT
    CASE
        WHEN score_numeric < 1.5 THEN 'novice'
        WHEN score_numeric < 2.5 THEN 'intermediate'
        WHEN score_numeric < 3.5 THEN 'advanced'
        ELSE 'expert'
    END AS score_level
FROM weighted_participant_scores
WHERE course_phase_id = $1 AND course_participation_id = $2;
