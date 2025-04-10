-- name: GetSurveyDeadline :one
SELECT survey_deadline
FROM survey_timeframe
WHERE course_phase_id = $1;