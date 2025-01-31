-- name: GetCourseParticipation :one
SELECT * FROM course_participation
WHERE id = $1 LIMIT 1;

-- name: GetAllCourseParticipationsForCourse :many
SELECT * FROM course_participation
WHERE course_id = $1;

-- name: GetAllCourseParticipationsForStudent :many
SELECT * FROM course_participation
WHERE student_id = $1;

-- name: CreateCourseParticipation :one
INSERT INTO course_participation (id, course_id, student_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetCourseParticipationByStudentAndCourseID :one
SELECT * FROM course_participation
WHERE student_id = $1 AND course_id = $2 LIMIT 1;

-- name: GetCourseParticipationByCourseIDAndMatriculation :one
SELECT 
    cp.id, 
    cp.course_id, 
    cp.student_id, 
    ARRAY_AGG(cpp.course_phase_id)::uuid[] AS active_course_phases
FROM 
    course_participation cp
JOIN 
    course_phase_participation cpp ON cpp.course_participation_id = cp.id 
JOIN 
    student s ON s.id = cp.student_id
JOIN 
    course_phase cphase ON cphase.id = cpp.course_phase_id
WHERE 
    cp.course_id = $1 
    AND s.matriculation_number = $2 
    AND s.university_login = $3
GROUP BY 
    cp.id, 
    cp.course_id, 
    cp.student_id;