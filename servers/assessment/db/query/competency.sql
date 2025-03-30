-- Returns all root competencies (competencies with no parent).
-- name: GetRootCompetencies :many
SELECT id, super_competency_id, name, description
FROM competency
WHERE super_competency_id IS NULL;

-- Returns all sub-competencies for a given parent competency.
-- name: GetSubCompetencies :many
SELECT id, super_competency_id, name, description
FROM competency
WHERE super_competency_id = $1;

-- Returns a single competency by its id.
-- name: GetCompetencyByID :one
SELECT id, super_competency_id, name, description
FROM competency
WHERE id = $1;

-- Inserts a new competency.
-- name: InsertCompetency :exec
INSERT INTO competency (id, super_competency_id, name, description)
VALUES ($1, $2, $3, $4);

-- Updates an existing competency.
-- name: UpdateCompetency :exec
UPDATE competency
SET super_competency_id = $2,
    name = $3,
    description = $4
WHERE id = $1;

-- Deletes a competency by its id.
-- name: DeleteCompetency :exec
DELETE FROM competency
WHERE id = $1;