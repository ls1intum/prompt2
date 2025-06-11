-- name: CreateAssessmentTemplate :exec
INSERT INTO assessment_template (id, name, description, created_at, updated_at)
VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- name: GetAssessmentTemplate :one
SELECT *
FROM assessment_template
WHERE id = $1;

-- name: ListAssessmentTemplates :many
SELECT *
FROM assessment_template
ORDER BY name ASC;

-- name: UpdateAssessmentTemplate :exec
UPDATE assessment_template
SET name        = $2,
    description = $3,
    updated_at  = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: DeleteAssessmentTemplate :exec
DELETE
FROM assessment_template
WHERE id = $1;

-- name: GetAssessmentTemplateByName :one
SELECT *
FROM assessment_template
WHERE name = $1;

-- name: CreateOrUpdateAssessmentTemplateCoursePhase :exec
INSERT INTO assessment_template_course_phase (assessment_template_id, course_phase_id)
VALUES ($1, $2)
ON CONFLICT (course_phase_id) 
DO UPDATE SET assessment_template_id = EXCLUDED.assessment_template_id;

-- name: DeleteAssessmentTemplateCoursePhase :exec
DELETE
FROM assessment_template_course_phase
WHERE assessment_template_id = $1
  AND course_phase_id = $2;

-- name: GetAssessmentTemplatesByCoursePhase :many
SELECT at.*
FROM assessment_template at
         INNER JOIN assessment_template_course_phase atcp ON at.id = atcp.assessment_template_id
WHERE atcp.course_phase_id = $1;

-- name: GetCoursePhasesByAssessmentTemplate :many
SELECT atcp.course_phase_id
FROM assessment_template_course_phase atcp
WHERE atcp.assessment_template_id = $1;

-- name: ListAssessmentTemplateCoursePhaseMappings :many
SELECT *
FROM assessment_template_course_phase
ORDER BY assessment_template_id, course_phase_id;