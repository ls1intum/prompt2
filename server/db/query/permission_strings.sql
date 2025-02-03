-- name: GetPermissionStringByCourseID :one
SELECT CONCAT(semester_tag, '-', name) AS course_identifier
FROM course
WHERE id = $1;

-- name: GetPermissionStringByCourseParticipationID :one
SELECT CONCAT(c.semester_tag, '-', c.name) AS course_identifier
FROM course c
JOIN course_participation cp ON c.id = cp.course_id
WHERE cp.id = $1;

-- name: GetPermissionStringByCoursePhaseID :one
SELECT CONCAT(c.semester_tag, '-', c.name) AS course_identifier
FROM course c
JOIN course_phase cp ON c.id = cp.course_id
WHERE cp.id = $1;

-- name: GetPermissionStringByCoursePhaseParticipationID :one
SELECT CONCAT(c.semester_tag, '-', c.name) AS course_identifier
FROM course c
JOIN course_participation cp ON c.id = cp.course_id
JOIN course_phase_participation cpp ON cp.id = cpp.course_participation_id
WHERE cpp.id = $1;



-- name: GetStudentRoleStrings :many
SELECT CONCAT(c.semester_tag, '-', c.name, '-Student')::text AS student_role
FROM course c
JOIN course_participation cp ON c.id = cp.course_id
JOIN student s ON cp.student_id = s.id
WHERE s.matriculation_number = $1
AND s.university_login = $2;