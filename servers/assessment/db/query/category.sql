-- name: CreateCategory :one
INSERT INTO category (id, name, description)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetCategory :one
SELECT * FROM category WHERE id = $1;

-- name: ListCategories :many
SELECT * FROM category;

-- name: UpdateCategory :one
UPDATE category
SET name = $2, description = $3
WHERE id = $1
RETURNING *;

-- name: DeleteCategory :exec
DELETE FROM category WHERE id = $1;

-- name: GetCategoriesWithCompetencies :many
SELECT
    c.id, c.name, c.description,
    json_agg(
        json_build_object(
            'id', cmp.id,
            'name', cmp.name,
            'description', cmp.description,
            'novice', cmp.novice,
            'intermediate', cmp.intermediate,
            'advanced', cmp.advanced,
            'expert', cmp.expert
        )
    ) AS competencies
FROM category c
LEFT JOIN competency cmp ON c.id = cmp.category_id
GROUP BY c.id, c.name, c.description;
