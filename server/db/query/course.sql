-- name: GetCourse :one
SELECT * FROM course
WHERE id = $1 LIMIT 1;

-- name: GetAllActiveCourses :many
SELECT * FROM course
WHERE end_date >= NOW() - INTERVAL '1 month';;

-- name: CreateCourse :one
INSERT INTO course (id, name, start_date, end_date, semester_tag, course_type, ects, meta_data)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
RETURNING *;