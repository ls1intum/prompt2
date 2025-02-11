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

-- name: TestMatchingPhaseTypeExists :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_type
    WHERE name = 'Matching'
) AS does_exist;

-- name: CreateCoursePhaseType :exec
INSERT INTO course_phase_type (id, name, initial_phase, base_url)
VALUES ($1, $2, $3, $4);

-- TODO: add queries to store the required and provided output/input dto