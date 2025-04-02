-- name: CreateCategory :exec
INSERT INTO category (id, name, description)
VALUES ($1, $2, $3);

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
    cmp.id AS competency_id, cmp.category_id, cmp.name AS competency_name,
    cmp.description AS competency_description, cmp.novice, cmp.intermediate,
    cmp.advanced, cmp.expert
FROM category c
JOIN competency cmp ON c.id = cmp.category_id;
