-- name: CreateCompetency :exec
INSERT INTO competency (
    id, category_id, name, description, novice,
    intermediate, advanced, expert, weight
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);

-- name: GetCompetency :one
SELECT * FROM competency WHERE id = $1;

-- name: ListCompetencies :many
SELECT * FROM competency;

-- name: ListCompetenciesByCategory :many
SELECT * FROM competency WHERE category_id = $1;

-- name: UpdateCompetency :exec
UPDATE competency
SET category_id = $2,
    name = $3,
    description = $4,
    novice = $5,
    intermediate = $6,
    advanced = $7,
    expert = $8,
    weight = $9
WHERE id = $1;

-- name: DeleteCompetency :exec
DELETE FROM competency WHERE id = $1;