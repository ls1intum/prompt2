-- name: GetCoursePhaseParticipation :one
SELECT * FROM course_phase_participation
WHERE id = $1 LIMIT 1;

-- name: GetAllCoursePhaseParticipationsForCoursePhase :many
SELECT
    cpp.id AS course_phase_participation_id,
    cpp.passed,
    cpp.meta_data,
    s.id AS student_id,
    s.first_name,
    s.last_name,
    s.email,
    s.matriculation_number,
    s.university_login,
    s.has_university_account,
    s.gender
FROM
    course_phase_participation cpp
JOIN
    course_participation cp ON cpp.course_participation_id = cp.id
JOIN
    student s ON cp.student_id = s.id
WHERE
    cpp.course_phase_id = $1;

-- name: GetAllCoursePhaseParticipationsForCourseParticipation :many
SELECT * FROM course_phase_participation
WHERE course_participation_id = $1;

-- name: CreateCoursePhaseParticipation :one
INSERT INTO course_phase_participation (id, course_participation_id, course_phase_id, passed, meta_data)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: UpdateCoursePhaseParticipation :one
UPDATE course_phase_participation
SET 
    passed = COALESCE($2, passed),
    meta_data = meta_data || $3
WHERE id = $1
RETURNING *;

-- name: GetCoursePhaseParticipationByCourseParticipationAndCoursePhase :one
SELECT * FROM course_phase_participation
WHERE course_participation_id = $1 AND course_phase_id = $2 LIMIT 1;