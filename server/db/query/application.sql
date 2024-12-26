-- name: GetApplicationQuestionsTextForCoursePhase :many
SELECT * FROM application_question_text
WHERE course_phase_id = $1;

-- name: GetApplicationQuestionsMultiSelectForCoursePhase :many
SELECT * FROM application_question_multi_select
WHERE course_phase_id = $1;

-- name: CreateApplicationAnswerText :one
INSERT INTO application_answer_text (id, application_question_id, course_phase_participation_id, answer)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: CreateApplicationAnswerMultiSelect :one
INSERT INTO application_answer_multi_select (id, application_question_id, course_phase_participation_id, answer)
VALUES ($1, $2, $3, $4)
RETURNING *;

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
