-- name: CreateCompetency :exec
INSERT INTO competency (
        id,
        category_id,
        name,
        short_name,
        description,
        description_very_bad,
        description_bad,
        description_ok,
        description_good,
        description_very_good,
        weight
    )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);

-- name: GetCompetency :one
SELECT *
FROM competency
WHERE id = $1;

-- name: ListCompetencies :many
SELECT *
FROM competency;

-- name: ListCompetenciesByCategory :many
SELECT *
FROM competency
WHERE category_id = $1;

-- name: UpdateCompetency :exec
UPDATE competency
SET category_id = $2,
    name = $3,
    short_name = $4,
    description = $5,
    description_very_bad = $6,
    description_bad = $7,
    description_ok = $8,
    description_good = $9,
    description_very_good = $10,
    weight = $11
WHERE id = $1;

-- name: DeleteCompetency :exec
DELETE FROM competency
WHERE id = $1;