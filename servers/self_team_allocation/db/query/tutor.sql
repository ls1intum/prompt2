-- name: CreateTutor :exec
INSERT INTO tutor (course_phase_id, course_participation_id, first_name, last_name, team_id)
VALUES ($1, $2, $3, $4, $5);

-- name: GetTutorsByCoursePhase :many
SELECT *
FROM tutor
WHERE course_phase_id = $1
ORDER BY first_name, last_name;

-- name: GetTutorsByTeamID :many
SELECT *
FROM tutor
WHERE team_id = $1
  AND course_phase_id = $2
ORDER BY first_name, last_name;

-- name: GetTutorByCourseParticipationID :one
SELECT *
FROM tutor
WHERE course_participation_id = $1
  AND course_phase_id = $2;

-- name: DeleteTutor :exec
DELETE FROM tutor
WHERE course_participation_id = $1
  AND course_phase_id = $2;

-- name: DeleteTutorsByTeamID :exec
DELETE FROM tutor
WHERE team_id = $1
  AND course_phase_id = $2;
