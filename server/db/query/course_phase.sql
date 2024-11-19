-- name: GetCoursePhase :one
SELECT * FROM course_phase
WHERE id = $1 LIMIT 1;

-- name: GetAllCoursePhaseForCourse :many
SELECT * FROM course_phase
WHERE course_id = $1;

-- name: CreateCoursePhase :one
INSERT INTO course_phase (id, course_id, name, is_initial_phase, meta_data)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: UpdateCoursePhase :exec
UPDATE course_phase
SET 
    name = COALESCE($2, name), 
    is_initial_phase = COALESCE($3, is_initial_phase), 
    meta_data = meta_data || $4
WHERE id = $1;