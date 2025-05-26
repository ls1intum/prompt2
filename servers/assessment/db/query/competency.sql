-- name: CreateCompetency :exec
INSERT INTO competency (
    id, category_id, name, short_name, description, novice,
    intermediate, advanced, expert, weight
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);

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
    short_name = $4,
    description = $5,
    novice = $6,
    intermediate = $7,
    advanced = $8,
    expert = $9,
    weight = $10
WHERE id = $1;

-- name: DeleteCompetency :exec
DELETE FROM competency WHERE id = $1;