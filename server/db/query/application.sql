-- name: GetApplicationQuestionsTextForCoursePhase :many
SELECT * FROM application_question_text
WHERE course_phase_id = $1;

-- name: GetApplicationQuestionsMultiSelectForCoursePhase :many
SELECT * FROM application_question_multi_select
WHERE course_phase_id = $1;

-- name: CreateApplicationAnswerText :exec
INSERT INTO application_answer_text (id, application_question_id, course_phase_participation_id, answer)
VALUES ($1, $2, $3, $4);

-- name: CreateApplicationAnswerMultiSelect :exec
INSERT INTO application_answer_multi_select (id, application_question_id, course_phase_participation_id, answer)
VALUES ($1, $2, $3, $4);

-- name: CreateApplicationQuestionText :exec
INSERT INTO application_question_text (id, course_phase_id, title, description, placeholder, validation_regex, error_message, is_required, allowed_length, order_num)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);

-- name: CreateApplicationQuestionMultiSelect :exec
INSERT INTO application_question_multi_select (id, course_phase_id, title, description, placeholder, error_message, is_required, min_select, max_select, options, order_num)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);

-- name: UpdateApplicationQuestionMultiSelect :exec
UPDATE application_question_multi_select
SET
    title = COALESCE($2, title),
    description = COALESCE($3, description),
    placeholder = COALESCE($4, placeholder),
    error_message = COALESCE($5, error_message),
    is_required = COALESCE($6, is_required),
    min_select = COALESCE($7, min_select),
    max_select = COALESCE($8, max_select),
    options = COALESCE($9, options),
    order_num = COALESCE($10, order_num)
WHERE id = $1;

-- name: UpdateApplicationQuestionText :exec
UPDATE application_question_text
SET
    title = COALESCE($2, title),
    description = COALESCE($3, description),
    placeholder = COALESCE($4, placeholder),
    validation_regex = COALESCE($5, validation_regex),
    error_message = COALESCE($6, error_message),
    is_required = COALESCE($7, is_required),
    allowed_length = COALESCE($8, allowed_length),
    order_num = COALESCE($9, order_num)
WHERE id = $1;



-- name: CheckIfCoursePhaseIsApplicationPhase :one
SELECT 
    cpt.name = 'Application' AS is_application
FROM 
    course_phase cp
JOIN 
    course_phase_type cpt
ON 
    cp.course_phase_type_id = cpt.id
WHERE 
    cp.id = $1;

-- name: DeleteApplicationQuestionText :exec
DELETE FROM application_question_text
WHERE id = $1;

-- name: DeleteApplicationQuestionMultiSelect :exec
DELETE FROM application_question_multi_select
WHERE id = $1;

-- name: GetAllOpenApplicationPhases :many
SELECT 
    cp.id AS course_phase_id,
    c.name AS course_name,
    c.start_date, 
    c.end_date,
    c.course_type, 
    c.ects,
    (cp.meta_data->>'applicationEndDate')::text AS application_end_date,
    (cp.meta_data->>'externalStudentsAllowed')::boolean AS external_students_allowed
FROM 
    course_phase cp
JOIN 
    course_phase_type cpt
    ON cp.course_phase_type_id = cpt.id
JOIN 
    course c
    ON cp.course_id = c.id
WHERE 
    cp.is_initial_phase = true
    AND cpt.name = 'Application'
    AND (cp.meta_data->>'applicationEndDate')::timestamp > NOW()
    AND (cp.meta_data->>'applicationStartDate')::timestamp < NOW();

-- name: GetOpenApplicationPhase :one
SELECT 
    cp.id AS course_phase_id,
    c.name AS course_name,
    c.start_date, 
    c.end_date,
    c.course_type, 
    c.ects,
    (cp.meta_data->>'applicationEndDate')::text AS application_end_date,
    (cp.meta_data->>'externalStudentsAllowed')::boolean AS external_students_allowed
FROM 
    course_phase cp
JOIN 
    course_phase_type cpt
    ON cp.course_phase_type_id = cpt.id
JOIN 
    course c
    ON cp.course_id = c.id
WHERE 
    cp.id = $1
    AND cp.is_initial_phase = true
    AND cpt.name = 'Application'
    AND (cp.meta_data->>'applicationEndDate')::timestamp > NOW()
    AND (cp.meta_data->>'applicationStartDate')::timestamp < NOW();

-- name: GetApplicationExistsForStudent :one
SELECT EXISTS (
    SELECT 1
    FROM course_participation cp
    INNER JOIN course_phase ph ON cp.course_id = ph.course_id
    WHERE cp.student_id = $1 AND ph.id = $2
);

-- name: CheckIfCoursePhaseIsOpenApplicationPhase :one
SELECT 
    cpt.name = 'Application' AS is_application
FROM 
    course_phase cp
JOIN 
    course_phase_type cpt
ON 
    cp.course_phase_type_id = cpt.id
WHERE 
    cp.id = $1
    AND (cp.meta_data->>'applicationEndDate')::timestamp > NOW();

-- name: GetApplicationAnswersTextForStudent :many
SELECT aat.*
FROM application_answer_text aat
INNER JOIN course_phase_participation cpp ON aat.course_phase_participation_id = cpp.id
INNER JOIN course_participation cp ON cpp.course_participation_id = cp.id
WHERE cp.student_id = $1 AND cpp.course_phase_id = $2;

-- name: GetApplicationAnswersMultiSelectForStudent :many
SELECT aams.*
FROM application_answer_multi_select aams
INNER JOIN course_phase_participation cpp ON aams.course_phase_participation_id = cpp.id
INNER JOIN course_participation cp ON cpp.course_participation_id = cp.id
WHERE cp.student_id = $1 AND cpp.course_phase_id = $2;

-- name: CreateOrOverwriteApplicationAnswerText :exec 
INSERT INTO application_answer_text (id, application_question_id, course_phase_participation_id, answer)
VALUES ($1, $2, $3, $4)
ON CONFLICT (course_phase_participation_id, application_question_id)
DO UPDATE
SET answer = EXCLUDED.answer;

-- name: CreateOrOverwriteApplicationAnswerMultiSelect :exec 
INSERT INTO application_answer_multi_select (id, application_question_id, course_phase_participation_id, answer)
VALUES ($1, $2, $3, $4)
ON CONFLICT (course_phase_participation_id, application_question_id)
DO UPDATE
SET answer = EXCLUDED.answer;

-- name: GetApplicationExists :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_participation cpp
    WHERE cpp.course_phase_id = $1
    AND cpp.id = $2
);

-- name: GetAllApplicationParticipations :many
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
    s.gender, 
    a.score
FROM
    course_phase_participation cpp
JOIN
    course_participation cp ON cpp.course_participation_id = cp.id
JOIN
    student s ON cp.student_id = s.id
LEFT JOIN
    application_assessment a on cpp.id = a.course_phase_participation_id
WHERE
    cpp.course_phase_id = $1;

-- name: UpdateApplicationAssessment :exec
INSERT INTO application_assessment (id, course_phase_participation_id, score)
VALUES (
    gen_random_uuid(),    
    $1,                   
    $2             
)
ON CONFLICT (course_phase_participation_id) 
DO UPDATE 
SET score = EXCLUDED.score; 

-- name: CheckCoursePhaseParticipationPair :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_participation cpp
    WHERE cpp.id = $1
      AND cpp.course_phase_id = $2
);
