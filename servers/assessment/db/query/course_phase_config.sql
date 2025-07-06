-- name: GetCoursePhaseConfig :one
SELECT *
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: CreateOrUpdateAssessmentTemplateCoursePhase :exec
INSERT INTO course_phase_config (assessment_template_id, course_phase_id)
VALUES ($1, $2)
ON CONFLICT (course_phase_id)
    DO UPDATE SET assessment_template_id = EXCLUDED.assessment_template_id;

-- name: GetCoursePhasesByAssessmentTemplate :many
SELECT course_phase_id
FROM course_phase_config
WHERE assessment_template_id = $1;

-- name: ListAssessmentTemplateCoursePhaseMappings :many
SELECT *
FROM course_phase_config
ORDER BY assessment_template_id, course_phase_id;

-- name: GetCoursePhaseDeadline :one
SELECT deadline
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: GetSelfAssessmentDeadline :one
SELECT self_assessment_deadline
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: GetPeerAssessmentDeadline :one
SELECT peer_assessment_deadline
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: CreateOrUpdateCoursePhaseConfig :exec
INSERT INTO course_phase_config (
    assessment_template_id, 
    course_phase_id, 
    deadline, 
    self_assessment_enabled, 
    self_assessment_template, 
    self_assessment_deadline, 
    peer_assessment_enabled, 
    peer_assessment_template, 
    peer_assessment_deadline
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (course_phase_id)
DO UPDATE SET
    assessment_template_id = EXCLUDED.assessment_template_id,
    deadline = EXCLUDED.deadline,
    self_assessment_enabled = EXCLUDED.self_assessment_enabled,
    self_assessment_template = EXCLUDED.self_assessment_template,
    self_assessment_deadline = EXCLUDED.self_assessment_deadline,
    peer_assessment_enabled = EXCLUDED.peer_assessment_enabled,
    peer_assessment_template = EXCLUDED.peer_assessment_template,
    peer_assessment_deadline = EXCLUDED.peer_assessment_deadline;
