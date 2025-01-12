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
WITH RECURSIVE backward_chain AS (
    /*
     * Starting from the *current* phase $1, walk backwards
     * via `course_phase_graph` until we can no longer go back.
     * This will gather all the "previous" phases (including the current one).
     */
    SELECT
        cp.id AS phase_id,
        cp.course_phase_type_id
    FROM course_phase cp
    WHERE cp.id = $1
    
    UNION ALL

    SELECT
        cpg.from_course_phase_id AS phase_id,
        cp2.course_phase_type_id
    FROM course_phase_graph cpg
    JOIN course_phase cp2
      ON cp2.id = cpg.from_course_phase_id
    JOIN backward_chain bc
      ON bc.phase_id = cpg.to_course_phase_id
), 
-----------------------------------------------------------------------
-- 1) Existing participants in the current phase
-----------------------------------------------------------------------
current_phase_participations AS (
    SELECT
        cpp.id            AS course_phase_participation_id,
        cpp.pass_status   AS pass_status,
        cpp.meta_data     AS meta_data,
        s.id             AS student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.matriculation_number,
        s.university_login,
        s.has_university_account,
        s.gender,
        cp.id            AS course_participation_id
    FROM course_phase_participation cpp
    JOIN course_participation cp
      ON cpp.course_participation_id = cp.id
    JOIN student s
      ON cp.student_id = s.id
    WHERE cpp.course_phase_id = $1
),
-----------------------------------------------------------------------
-- 2) “Would-be” participants: those who do NOT yet have a participation 
--    for this phase but have 'passed' the chain of *all* previous phases.
-----------------------------------------------------------------------
qualified_non_participants AS (
    SELECT
        -- No current participation for this phase
        NULL::uuid                     AS course_phase_participation_id,
        'not_assessed'::pass_status    AS pass_status,
        '{}'::jsonb                    AS meta_data,
        s.id                           AS student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.matriculation_number,
        s.university_login,
        s.has_university_account,
        s.gender,
        cp.id                          AS course_participation_id
    FROM course_participation cp
    JOIN student s 
      ON cp.student_id = s.id

    -- Filter out those who already have a row for course_phase_id = $1
    WHERE NOT EXISTS (
        SELECT 1
        FROM course_phase_participation new_cpp
        WHERE new_cpp.course_phase_id = $1
          AND new_cpp.course_participation_id = cp.id
    )

    -- And ensure they have 'passed' in the previous phase 
    -- We filter just previous, not all since phase order might change or get unlinear at some point
    AND EXISTS (
        SELECT 1
        FROM backward_chain bc
        JOIN course_phase_participation pcpp
          ON pcpp.course_phase_id = bc.phase_id
         AND pcpp.course_participation_id = cp.id
        WHERE bc.phase_id != $1
          AND (pcpp.pass_status = 'passed')
    )
)
-----------------------------------------------------------------------
-- Final selection with "prev_meta_data" included
-----------------------------------------------------------------------
SELECT
    main.*,

   COALESCE((
       SELECT jsonb_object_agg(each.key, each.value)
       FROM backward_chain bc
       JOIN course_phase_participation pcpp
         ON pcpp.course_phase_id = bc.phase_id
        AND pcpp.course_participation_id = main.course_participation_id
       JOIN course_phase_type cpt
         ON cpt.id = bc.course_phase_type_id
       CROSS JOIN LATERAL jsonb_each(pcpp.meta_data) each
       WHERE 
         -- Only keep meta_data where the JSON key matches one of the "name" attributes
         each.key IN (
             SELECT elem->>'name'
             FROM jsonb_array_elements(cpt.provided_output_meta_data) AS elem
         )
    ), '{}')::jsonb AS prev_meta_data

FROM
(
    -- Combine existing participants + new "qualified" participants
    SELECT * FROM current_phase_participations
    UNION
    SELECT * FROM qualified_non_participants

) AS main
ORDER BY main.last_name, main.first_name; 
