-- name: CreateTutor :exec
INSERT INTO tutor (course_phase_id, id, first_name, last_name, email, matriculation_number, university_login)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetAllTutors :many
SELECT * 
FROM tutor
WHERE course_phase_id = $1;

-- name: UpdateTutorGitlabUsername :exec
UPDATE tutor
SET gitlab_username = $3
WHERE id = $1
AND course_phase_id = $2;