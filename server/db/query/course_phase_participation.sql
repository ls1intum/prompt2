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

--- We need to ensure that the course_participation_id and course_phase_id 
--- belong to the same course.
-- name: CreateCoursePhaseParticipation :one
INSERT INTO course_phase_participation
    (id, course_participation_id, course_phase_id, pass_status, meta_data)
SELECT
    $1 AS id,
    $2 AS course_participation_id,
    $3 AS course_phase_id,
    $4 AS pass_status,
    $5 AS meta_data
FROM course_participation cp
JOIN course_phase cph ON cp.course_id = cph.course_id
WHERE cp.id = $2
  AND cph.id = $3
RETURNING *;

-- name: UpdateCoursePhaseParticipation :one
UPDATE course_phase_participation
SET 
    pass_status = COALESCE($2, pass_status),   
    meta_data = meta_data || $3
WHERE id = $1
AND course_phase_id = $4
RETURNING id; -- important to trigger a no rows in result set error if ids mismatch

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
WITH 
-----------------------------------------------------------------------
-- A) Phases a student must have 'passed' (per course_phase_graph)
-- Identify the single previous phase (if any) required for PASS 
-----------------------------------------------------------------------
direct_predecessor_for_pass AS (
    SELECT cpg.from_course_phase_id AS phase_id
    FROM course_phase_graph cpg
    WHERE cpg.to_course_phase_id = $1
),

-----------------------------------------------------------------------
-- B) Phases from which we pull metadata (per meta_data_dependency_graph)
-----------------------------------------------------------------------
direct_predecessors_for_meta AS (
  SELECT 
    from_phase_id AS phase_id,
    cp.meta_data AS course_phase_meta_data,
    cp.course_phase_type_id AS course_phase_type_id
  FROM meta_data_dependency_graph
  JOIN course_phase cp
    ON cp.id = from_phase_id
  WHERE to_phase_id = $1
),

-----------------------------------------------------------------------
-- 1) Existing participants in the current phase
-----------------------------------------------------------------------
current_phase_participations AS (
    SELECT
        cpp.id                   AS course_phase_participation_id,
        cpp.pass_status          AS pass_status,
        cpp.meta_data            AS meta_data,
        s.id                     AS student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.matriculation_number,
        s.university_login,
        s.has_university_account,
        s.gender,
        cp.id                    AS course_participation_id
    FROM course_phase_participation cpp
    JOIN course_participation cp 
      ON cpp.course_participation_id = cp.id
    JOIN student s 
      ON cp.student_id = s.id
    WHERE cpp.course_phase_id = $1
),

-----------------------------------------------------------------------
-- 2) Would-be participants: 
--    - They do NOT yet have a course_phase_participation for $1
--    - Must have passed ALL direct_predecessors_for_pass
-----------------------------------------------------------------------
qualified_non_participants AS (
    SELECT
        NULL::uuid                   AS course_phase_participation_id,
        'not_assessed'::pass_status  AS pass_status,
        '{}'::jsonb                  AS meta_data,
        s.id                         AS student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.matriculation_number,
        s.university_login,
        s.has_university_account,
        s.gender,
        cp.id                        AS course_participation_id
    FROM course_participation cp
    JOIN student s 
      ON cp.student_id = s.id

    WHERE 
      -- Exclude if they already have a participation in the current phase
      NOT EXISTS (
        SELECT 1
        FROM course_phase_participation new_cpp
        WHERE new_cpp.course_phase_id = $1
          AND new_cpp.course_participation_id = cp.id
      )
      
    -- And ensure they have 'passed' in the previous phase 
    -- We filter just previous, not all since phase order might change or allow for non-linear courses at some point
    AND EXISTS (
        SELECT 1
        FROM direct_predecessor_for_pass dpp
        JOIN  course_phase_participation pcpp
          ON pcpp.course_phase_id = dpp.phase_id
          AND pcpp.course_participation_id = cp.id
        WHERE (pcpp.pass_status = 'passed')
    )
)

-----------------------------------------------------------------------
-- 3) Final SELECT: 
--    a) Combine existing + qualified participants
--    b) Merge all relevant meta_data from *all* direct_predecessors_for_meta
-----------------------------------------------------------------------
SELECT
    main.*,
    (COALESCE(
       (
          ----------------------------------------------------------------
          -- Getting non application meta data
          ----------------------------------------------------------------
          
          SELECT jsonb_object_agg(each.key, each.value)
          FROM direct_predecessors_for_meta dpm
          JOIN course_phase_participation pcpp
            ON pcpp.course_phase_id = dpm.phase_id
            AND pcpp.course_participation_id = main.course_participation_id
          JOIN course_phase_type cpt
            ON cpt.id = dpm.course_phase_type_id
            AND cpt.name != 'Application'
          CROSS JOIN LATERAL jsonb_each(pcpp.meta_data) each
            WHERE 
            -- Only keep meta_data where the JSON key matches one of the "name" attributes
                each.key IN (
                    SELECT elem->>'name'
                    FROM jsonb_array_elements(cpt.provided_output_meta_data) AS elem
                ) 
       ),
       '{}'
    )::jsonb ||
    COALESCE (
        (
          ----------------------------------------------------------------
          -- Getting meta data from the application phase (if it is a meta-data predecessor)
          -- We are expecting the following application meta data:
          -- {
          --   "exportAnswers": {
            --     "applicationScore": true,
            --     "additionalScores": [
            --       {  
            --         "key": "newName/Key",
            --         "name": "score1ToBeExported"
            --       }
            --     "answersText": [
            --       {
            --         "questionID": "uuid",
            --         "key": "string"
            --       }
            --     ],
            --     "answersMultiSelect": [
            --       {
            --         "questionID": "uuid",
            --         "key": "string"
            --       }
            --     ]
            --   }
          -- }
          ----------------------------------------------------------------
         SELECT appdata.obj
         FROM direct_predecessors_for_meta dpm
         JOIN course_phase_participation pcpp
           ON pcpp.course_phase_id = dpm.phase_id
          AND pcpp.course_participation_id = main.course_participation_id
         JOIN course_phase_type cpt
           ON cpt.id = dpm.course_phase_type_id
          AND cpt.name = 'Application'
          CROSS JOIN LATERAL (
             SELECT jsonb_build_object(
                     ----------------------------------------------------------
                     -- (A) Application Score
                     ----------------------------------------------------------
                     'applicationScore', (
                         SELECT to_jsonb(aasm.score)
                         FROM application_assessment aasm
                         WHERE aasm.course_phase_participation_id = pcpp.id
                           AND (dpm.course_phase_meta_data->'exportAnswers'->>'applicationScore') = 'true'
                     ),
                     ----------------------------------------------------------
                     -- (B) Additional Scores
                     ----------------------------------------------------------
                     'additionalScores', (
                         SELECT jsonb_agg(
                             jsonb_build_object(
                               'key', question_config->>'key',
                               'answer', pcpp.meta_data -> (question_config->>'key')
                             )
                         )
                         FROM jsonb_array_elements(
                                dpm.course_phase_meta_data->'additionalScores'
                              ) question_config
                     ),
                     ----------------------------------------------------------
                     -- (C) Aggregate Answers from text and multi-select questions
                     ----------------------------------------------------------
                     'applicationAnswers', (
                         SELECT jsonb_agg(answer_obj)
                         FROM (
                            -- Text answers
                            SELECT jsonb_build_object(
                                'key', qt.access_key,
                                'answer', to_jsonb(aat.answer),
                                'order_num', qt.order_num, 
                                'type', 'text'
                            ) AS answer_obj
                            FROM application_question_text qt
                            JOIN application_answer_text aat
                              ON aat.application_question_id = qt.id
                             AND aat.course_phase_participation_id = pcpp.id
                            WHERE qt.course_phase_id = dpm.phase_id
                              AND qt.accessible_for_other_phases = true
                              AND qt.access_key IS NOT NULL
                              AND qt.access_key <> ''
                            
                            UNION ALL
                            
                            -- Multi-select answers
                            SELECT jsonb_build_object(
                                'key', qm.access_key,
                                'answer', to_jsonb(aams.answer),
                                'order_num', qm.order_num, 
                                'type', 'multiselect'
                            ) AS answer_obj
                            FROM application_question_multi_select qm
                            JOIN application_answer_multi_select aams
                              ON aams.application_question_id = qm.id
                             AND aams.course_phase_participation_id = pcpp.id
                            WHERE qm.course_phase_id = dpm.phase_id
                              AND qm.accessible_for_other_phases = true
                              AND qm.access_key IS NOT NULL
                              AND qm.access_key <> ''
                         ) answer_union
                 )
             ) AS obj
         ) appdata
       ),
       '{}'
    )::jsonb)::jsonb AS prev_meta_data

FROM
(
    SELECT * FROM current_phase_participations
    UNION
    SELECT * FROM qualified_non_participants
) AS main
ORDER BY main.last_name, main.first_name;
