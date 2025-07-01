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