-- name: GetStudent :one
SELECT * FROM student
WHERE id = $1 LIMIT 1;

-- name: GetStudentByCourseParticipationID :one
SELECT s.*
FROM student s
INNER JOIN course_participation cp ON s.id = cp.student_id
WHERE cp.id = $1;

-- name: GetAllStudents :many
SELECT * FROM student;

-- name: CreateStudent :one
INSERT INTO student (id, first_name, last_name, email, matriculation_number, university_login, has_university_account, gender, nationality, study_program, study_degree, current_semester)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
    nationality = $9,
    study_program = $10,
    study_degree = $11,
    current_semester = $12
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

-- name: GetStudentEmails :many
SELECT id, email
FROM student
WHERE id = ANY($1::uuid[]);

-- name: GetStudentsByEmail :many
SELECT * FROM student
WHERE email = ANY($1::text[]);
