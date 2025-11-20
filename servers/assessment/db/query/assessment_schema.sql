-- name: CreateAssessmentSchema :exec
INSERT INTO assessment_schema (id, name, description, created_at, updated_at)
VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- name: GetAssessmentSchema :one
SELECT *
FROM assessment_schema
WHERE id = $1;

-- name: ListAssessmentSchemas :many
SELECT *
FROM assessment_schema
ORDER BY name ASC;

-- name: UpdateAssessmentSchema :exec
UPDATE assessment_schema
SET name        = $2,
    description = $3,
    updated_at  = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: DeleteAssessmentSchema :exec
DELETE
FROM assessment_schema
WHERE id = $1;

-- name: GetAssessmentSchemaByName :one
SELECT *
FROM assessment_schema
WHERE name = $1;