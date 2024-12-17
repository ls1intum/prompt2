-- name: GetCoursePhase :one
SELECT cp.*, cpt.name AS course_phase_type_name
FROM course_phase cp
INNER JOIN course_phase_type cpt ON cp.course_phase_type_id = cpt.id
WHERE cp.id = $1
LIMIT 1;

-- name: GetAllCoursePhaseForCourse :many
SELECT cp.*, cpt.name AS course_phase_type_name
FROM course_phase cp
INNER JOIN course_phase_type cpt ON cp.course_phase_type_id = cpt.id
WHERE cp.course_id = $1;

-- name: CreateCoursePhase :one
INSERT INTO course_phase (id, course_id, name, is_initial_phase, meta_data, course_phase_type_id)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: UpdateCoursePhase :exec
UPDATE course_phase
SET 
    name = COALESCE($2, name), 
    is_initial_phase = COALESCE($3, is_initial_phase), 
    meta_data = meta_data || $4
WHERE id = $1;

-- name: DeleteCoursePhase :exec
DELETE FROM course_phase
WHERE id = $1;
