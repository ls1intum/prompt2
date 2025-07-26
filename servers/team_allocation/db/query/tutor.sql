-- name: CreateTutor :exec
INSERT INTO tutor (course_phase_id, course_participation_id, first_name, last_name, team_id)
VALUES ($1, $2, $3, $4, $5);

-- name: GetTutorByCourseParticipationID :one
SELECT t.*
FROM tutor t
WHERE t.course_participation_id = $1
  AND t.course_phase_id = $2;

-- name: GetTutorByTeamID :one
SELECT t.*
FROM tutor t
WHERE t.team_id = $1
  AND t.course_phase_id = $2;
