-- name: GetStudent :one
SELECT * FROM student
WHERE id = $1 LIMIT 1;

-- name: GetStudentByCoursePhaseParticipationID :one
SELECT s.*
FROM student s
INNER JOIN course_participation cp ON s.id = cp.student_id
INNER JOIN course_phase_participation cpp ON cp.id = cpp.course_participation_id
WHERE cpp.id = $1;

-- name: GetAllStudents :many
SELECT * FROM student;

-- name: CreateStudent :one
INSERT INTO student (id, first_name, last_name, email, matriculation_number, university_login, has_university_account, gender, nationality)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: UpdateStudent :one
UPDATE student
SET first_name = $2,
    last_name = $3,
    email = $4,
    matriculation_number = $5,
    university_login = $6,
    has_university_account = $7,
    gender = $8,
    nationality = $9
WHERE id = $1
RETURNING *;

-- name: GetStudentByEmail :one
SELECT * FROM student
WHERE email = $1 LIMIT 1;

-- name: SearchStudents :many
SELECT *
FROM student
WHERE (first_name || ' ' || last_name) ILIKE '%' || $1 || '%'
   OR first_name ILIKE '%' || $1 || '%'
   OR last_name ILIKE '%' || $1 || '%'
   OR email ILIKE '%' || $1 || '%'
   OR matriculation_number ILIKE '%' || $1 || '%'
   OR university_login ILIKE '%' || $1 || '%';