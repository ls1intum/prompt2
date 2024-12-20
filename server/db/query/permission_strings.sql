-- name: GetPermissionStringByCourseID :one
SELECT CONCAT(name, '-', semester_tag) AS course_identifier
FROM course
WHERE id = $1;

-- name: GetPermissionStringByCourseParticipationID :one
SELECT CONCAT(c.name, '-', c.semester_tag) AS course_identifier
FROM course c
JOIN course_participation cp ON c.id = cp.course_id
WHERE cp.id = $1;

-- name: GetPermissionStringByCoursePhaseID :one
SELECT CONCAT(c.name, '-', c.semester_tag) AS course_identifier
FROM course c
JOIN course_phase cp ON c.id = cp.course_id
WHERE cp.id = $1;

-- name: GetPermissionStringByCoursePhaseParticipationID :one
SELECT CONCAT(c.name, '-', c.semester_tag) AS course_identifier
FROM course c
JOIN course_participation cp ON c.id = cp.course_id
JOIN course_phase_participation cpp ON cp.id = cpp.course_participation_id
WHERE cpp.id = $1;
