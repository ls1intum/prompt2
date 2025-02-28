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

-- name: GetCourseParticipationByStudentAndCoursePhaseID :one
SELECT course_participation.* 
FROM course_participation
JOIN course_phase cp 
    ON cp.course_id = course_participation.course_id
WHERE 
  course_participation.student_id = $1 
  AND cp.id = sqlc.arg(course_phase_id)::uuid 
LIMIT 1;

-- name: GetCourseParticipationByCourseIDAndMatriculation :one
WITH existing_phases AS (
    SELECT cpp.course_phase_id
    FROM course_participation cp
    JOIN course_phase_participation cpp 
        ON cpp.course_participation_id = cp.id
    JOIN student s 
        ON s.id = cp.student_id
    WHERE cp.course_id = $1 
      AND s.matriculation_number = $2 
      AND s.university_login = $3
),
passed_phases AS (
    SELECT cpp.course_phase_id
    FROM course_participation cp
    JOIN course_phase_participation cpp 
        ON cpp.course_participation_id = cp.id
    JOIN student s 
        ON s.id = cp.student_id
    WHERE cp.course_id = $1 
      AND s.matriculation_number = $2 
      AND s.university_login = $3
      AND cpp.pass_status = 'passed'
),
next_phases AS (
    SELECT cpg.to_course_phase_id
    FROM course_phase_graph cpg
    JOIN passed_phases pp
        ON cpg.from_course_phase_id = pp.course_phase_id
    WHERE cpg.to_course_phase_id NOT IN (
        SELECT course_phase_id FROM existing_phases
    )
)
SELECT 
    cp.id, 
    cp.course_id, 
    cp.student_id, 
    ARRAY_AGG(DISTINCT cp_ph.course_phase_id)::uuid[] AS active_course_phases
FROM 
    course_participation cp
JOIN 
    student s 
        ON s.id = cp.student_id
LEFT JOIN (
    -- Combine existing and eligible next phases
    SELECT course_phase_id FROM existing_phases
    UNION
    SELECT to_course_phase_id AS course_phase_id FROM next_phases
) AS cp_ph 
    ON TRUE
WHERE 
    cp.course_id = $1 
    AND s.matriculation_number = $2 
    AND s.university_login = $3
GROUP BY 
    cp.id, 
    cp.course_id, 
    cp.student_id;
