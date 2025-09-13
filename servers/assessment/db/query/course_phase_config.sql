-- name: GetCoursePhaseConfig :one
SELECT *
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: GetCoursePhasesByAssessmentTemplate :many
SELECT course_phase_id
FROM course_phase_config
WHERE assessment_template_id = $1;

-- name: ListAssessmentTemplateCoursePhaseMappings :many
SELECT *
FROM course_phase_config
ORDER BY assessment_template_id, course_phase_id;

-- name: IsAssessmentOpen :one
SELECT CASE
           WHEN start <= NOW() THEN true
           ELSE false
           END AS has_started
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: IsAssessmentDeadlinePassed :one
SELECT CASE
           WHEN deadline < NOW() THEN true
           ELSE false
           END AS is_deadline_passed
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: IsPeerEvaluationOpen :one
SELECT CASE
           WHEN peer_evaluation_enabled AND peer_evaluation_start <= NOW() THEN true
           ELSE false
           END AS has_peer_evaluation_started
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: IsPeerEvaluationDeadlinePassed :one
SELECT CASE
           WHEN peer_evaluation_deadline < NOW() THEN true
           ELSE false
           END AS is_peer_evaluation_deadline_passed
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: IsTutorEvaluationOpen :one
SELECT CASE
           WHEN tutor_evaluation_enabled AND tutor_evaluation_start <= NOW() THEN true
           ELSE false
           END AS has_tutor_evaluation_started
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: IsTutorEvaluationDeadlinePassed :one
SELECT CASE
           WHEN tutor_evaluation_deadline < NOW() THEN true
           ELSE false
           END AS is_tutor_evaluation_deadline_passed
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: IsSelfEvaluationOpen :one
SELECT CASE
           WHEN self_evaluation_enabled AND self_evaluation_start <= NOW() THEN true
           ELSE false
           END AS has_self_evaluation_started
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: IsSelfEvaluationDeadlinePassed :one
SELECT CASE
           WHEN self_evaluation_enabled AND self_evaluation_deadline < NOW() THEN true
           ELSE false
           END AS is_self_evaluation_deadline_passed
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: GetSelfEvaluationTimeframe :one
SELECT self_evaluation_start, self_evaluation_deadline
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: GetPeerEvaluationTimeframe :one
SELECT peer_evaluation_start, peer_evaluation_deadline
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: GetTutorEvaluationTimeframe :one
SELECT tutor_evaluation_start, tutor_evaluation_deadline
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: CreateDefaultCoursePhaseConfig :exec
INSERT INTO course_phase_config (course_phase_id)
VALUES ($1);

-- name: CreateOrUpdateCoursePhaseConfig :exec
INSERT INTO course_phase_config (assessment_template_id,
                                 course_phase_id,
                                 start,
                                 deadline,
                                 self_evaluation_enabled,
                                 self_evaluation_template,
                                 self_evaluation_start,
                                 self_evaluation_deadline,
                                 peer_evaluation_enabled,
                                 peer_evaluation_template,
                                 peer_evaluation_start,
                                 peer_evaluation_deadline,
                                 tutor_evaluation_enabled,
                                 tutor_evaluation_template,
                                 tutor_evaluation_start,
                                 tutor_evaluation_deadline,
                                 evaluation_results_visible)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
ON CONFLICT (course_phase_id)
    DO UPDATE SET assessment_template_id     = EXCLUDED.assessment_template_id,
                  start                      = EXCLUDED.start,
                  deadline                   = EXCLUDED.deadline,
                  self_evaluation_enabled    = EXCLUDED.self_evaluation_enabled,
                  self_evaluation_template   = EXCLUDED.self_evaluation_template,
                  self_evaluation_start      = EXCLUDED.self_evaluation_start,
                  self_evaluation_deadline   = EXCLUDED.self_evaluation_deadline,
                  peer_evaluation_enabled    = EXCLUDED.peer_evaluation_enabled,
                  peer_evaluation_template   = EXCLUDED.peer_evaluation_template,
                  peer_evaluation_start      = EXCLUDED.peer_evaluation_start,
                  peer_evaluation_deadline   = EXCLUDED.peer_evaluation_deadline,
                  tutor_evaluation_enabled   = EXCLUDED.tutor_evaluation_enabled,
                  tutor_evaluation_template  = EXCLUDED.tutor_evaluation_template,
                  tutor_evaluation_start     = EXCLUDED.tutor_evaluation_start,
                  tutor_evaluation_deadline  = EXCLUDED.tutor_evaluation_deadline,
                  evaluation_results_visible = EXCLUDED.evaluation_results_visible;
