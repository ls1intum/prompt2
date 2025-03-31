-- name: GetRootCompetencies :many
SELECT id, super_competency_id, name, description
FROM competency
WHERE super_competency_id IS NULL;

-- name: GetSubCompetencies :many
SELECT id, super_competency_id, name, description
FROM competency
WHERE super_competency_id = $1;

-- name: GetCompetencyByID :one
SELECT id, super_competency_id, name, description
FROM competency
WHERE id = $1;

-- name: InsertCompetency :exec
INSERT INTO competency (id, super_competency_id, name, description)
VALUES ($1, $2, $3, $4);

-- name: UpdateCompetency :exec
UPDATE competency
SET super_competency_id = $2,
    name = $3,
    description = $4
WHERE id = $1;

-- name: DeleteCompetency :exec
DELETE FROM competency
WHERE id = $1;