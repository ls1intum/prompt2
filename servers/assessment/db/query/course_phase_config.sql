-- name: GetCoursePhaseConfig :one
SELECT *
FROM course_phase_config
WHERE course_phase_id = $1;

-- name: CreateOrUpdateAssessmentTemplateCoursePhase :exec
INSERT INTO course_phase_config (assessment_template_id, course_phase_id)
VALUES ($1, $2)
ON CONFLICT (course_phase_id)
    DO UPDATE SET assessment_template_id = EXCLUDED.assessment_template_id;

-- name: DeleteAssessmentTemplateCoursePhase :exec
DELETE
FROM course_phase_config
WHERE assessment_template_id = $1
  AND course_phase_id = $2;

-- name: GetAssessmentTemplatesByCoursePhase :one
SELECT at.*
FROM assessment_template at
         INNER JOIN course_phase_config cpc ON at.id = cpc.assessment_template_id
WHERE cpc.course_phase_id = $1;

-- name: GetCoursePhasesByAssessmentTemplate :many
SELECT course_phase_id
FROM course_phase_config
WHERE assessment_template_id = $1;

-- name: ListAssessmentTemplateCoursePhaseMappings :many
SELECT *
FROM course_phase_config
ORDER BY assessment_template_id, course_phase_id;

-- name: UpdateCoursePhaseDeadline :exec
UPDATE course_phase_config
SET deadline = $1
WHERE course_phase_id = $2;

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

-- name: UpdateSelfAssessmentDeadline :exec
UPDATE course_phase_config
SET self_assessment_deadline = $1
WHERE course_phase_id = $2;

-- name: UpdatePeerAssessmentDeadline :exec
UPDATE course_phase_config
SET peer_assessment_deadline = $1
WHERE course_phase_id = $2;

-- name: GetSelfAssessmentTemplateByCoursePhase :one
SELECT at.*
FROM assessment_template at
         INNER JOIN course_phase_config cpc ON at.id = cpc.self_assessment_template
WHERE cpc.course_phase_id = $1;

-- name: GetPeerAssessmentTemplateByCoursePhase :one
SELECT at.*
FROM assessment_template at
         INNER JOIN course_phase_config cpc ON at.id = cpc.peer_assessment_template
WHERE cpc.course_phase_id = $1;

-- name: CreateOrUpdateSelfAssessmentTemplateCoursePhase :exec
UPDATE course_phase_config
SET self_assessment_template = $1
WHERE course_phase_id = $2;

-- name: CreateOrUpdatePeerAssessmentTemplateCoursePhase :exec
UPDATE course_phase_config
SET peer_assessment_template = $1
WHERE course_phase_id = $2;
