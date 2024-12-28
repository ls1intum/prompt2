-- name: GetCourseParticipation :one
SELECT * FROM course_participation
WHERE id = $1 LIMIT 1;

-- name: GetAllCourseParticipationsForCourse :many
SELECT * FROM course_participation
WHERE course_id = $1;

-- name: GetAllCourseParticipationsForStudent :many
SELECT * FROM course_participation
WHERE student_id = $1;

-- name: CreateCourseParticipation :one
INSERT INTO course_participation (id, course_id, student_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetCourseParticipationByStudentAndCourseID :one
SELECT * FROM course_participation
WHERE student_id = $1 AND course_id = $2 LIMIT 1;