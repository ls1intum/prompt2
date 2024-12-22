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

-- name: CreateApplicationQuestionText :one
INSERT INTO application_question_text (id, course_phase_id, title, description, placeholder, validation_regex, error_message, is_required, allowed_length, order_num)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING *;

-- name: CreateApplicationQuestionMultiSelect :one
INSERT INTO application_question_multi_select (id, course_phase_id, title, description, placeholder, error_message, is_required, min_select, max_select, options, order_num)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;

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