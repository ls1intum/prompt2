-- name: GetStudent :one
SELECT * FROM student
WHERE id = $1 LIMIT 1;

-- name: GetAllStudents :many
SELECT * FROM student;

-- name: CreateStudent :one
INSERT INTO student (id, first_name, last_name, email, matriculation_number, university_login, has_university_account, gender)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: UpdateStudent :one
UPDATE student
SET first_name = $2,
    last_name = $3,
    email = $4,
    matriculation_number = $5,
    university_login = $6,
    has_university_account = $7,
    gender = $8
WHERE id = $1
RETURNING *;

-- name: GetStudentByEmail :one
SELECT * FROM student
WHERE email = $1 LIMIT 1;
