-- name: GetAllCoursePhaseTypes :many
SELECT * FROM course_phase_type;

-- name: TestApplicationPhaseTypeExists :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_type
    WHERE name = 'Application'
) AS does_exist;

-- name: TestInterviewPhaseTypeExists :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_type
    WHERE name = 'Interview'
) AS does_exist;


-- name: CreateCoursePhaseType :exec
INSERT INTO course_phase_type (id, name, initial_phase, required_input_meta_data, provided_output_meta_data)
VALUES ($1, $2, $3, $4, $5);