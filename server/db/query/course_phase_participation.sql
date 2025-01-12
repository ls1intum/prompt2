-- name: GetCoursePhaseParticipation :one
SELECT * FROM course_phase_participation
WHERE id = $1 LIMIT 1;

-- name: GetAllCoursePhaseParticipationsForCoursePhase :many
SELECT
    cpp.id AS course_phase_participation_id,
    cpp.pass_status,
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
INSERT INTO course_phase_participation (id, course_participation_id, course_phase_id, pass_status, meta_data)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: UpdateCoursePhaseParticipation :exec
UPDATE course_phase_participation
SET 
    pass_status = COALESCE($2, pass_status),   
    meta_data = meta_data || $3
WHERE id = $1;

-- name: GetCoursePhaseParticipationByCourseParticipationAndCoursePhase :one
SELECT * FROM course_phase_participation
WHERE course_participation_id = $1 AND course_phase_id = $2 LIMIT 1;

-- name: UpdateCoursePhasePassStatus :many
UPDATE course_phase_participation
SET pass_status = $3::pass_status
WHERE id = ANY($1::uuid[])
  AND course_phase_id = $2::uuid
  AND pass_status != $3::pass_status
RETURNING course_participation_id;


-- name: GetAllCoursePhaseParticipationsForCoursePhaseIncludingPrevious :many
WITH previous_phase AS (
    SELECT
        from_course_phase_id AS prev_id
    FROM course_phase_graph
    WHERE to_course_phase_id = $1
)
SELECT
    -- Existing participation in the current phase
    cpp.id                          AS course_phase_participation_id,
    cpp.pass_status,
    cpp.meta_data,
    s.id                           AS student_id,
    s.first_name,
    s.last_name,
    s.email,
    s.matriculation_number,
    s.university_login,
    s.has_university_account,
    s.gender
FROM course_phase_participation cpp
JOIN course_participation cp ON cpp.course_participation_id = cp.id
JOIN student s ON cp.student_id = s.id
WHERE cpp.course_phase_id = $1

UNION

SELECT
    -- Students who do NOT yet have a participation for the current phase,
    -- but have passed the previous phase.
    NULL                           AS course_phase_participation_id,
    prev_cpp.pass_status           AS pass_status,
    prev_cpp.meta_data            AS meta_data,
    s.id                           AS student_id,
    s.first_name,
    s.last_name,
    s.email,
    s.matriculation_number,
    s.university_login,
    s.has_university_account,
    s.gender
FROM course_participation cp
JOIN student s ON cp.student_id = s.id
JOIN course_phase_participation prev_cpp
    ON cp.id = prev_cpp.course_participation_id
JOIN previous_phase cpg
    ON prev_cpp.course_phase_id = cpg.prev_id
WHERE prev_cpp.pass_status = 'passed'
  AND NOT EXISTS (
      SELECT 1
      FROM course_phase_participation new_cpp
      WHERE new_cpp.course_phase_id = $1
        AND new_cpp.course_participation_id = cp.id
  );
