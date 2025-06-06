-- name: CreateCategory :exec
INSERT INTO category (id, name, short_name, description, weight)
VALUES ($1, $2, $3, $4, $5);

-- name: GetCategory :one
SELECT * FROM category WHERE id = $1;

-- name: ListCategories :many
SELECT * FROM category
ORDER BY name ASC;

-- name: UpdateCategory :exec
UPDATE category
SET name = $2, short_name = $3, description = $4, weight = $5
WHERE id = $1;

-- name: DeleteCategory :exec
DELETE FROM category WHERE id = $1;

-- name: GetCategoriesWithCompetencies :many
SELECT
    c.id, c.name, c.short_name, c.description, c.weight,
    COALESCE(
        json_agg(
            json_build_object(
                'id', cmp.id,
                'categoryID', cmp.category_id,
                'name', cmp.name,
                'shortName', cmp.short_name,
                'description', cmp.description,
                'novice', cmp.novice,
                'intermediate', cmp.intermediate,
                'advanced', cmp.advanced,
                'expert', cmp.expert,
                'weight', cmp.weight
            )
        ) FILTER (WHERE cmp.id IS NOT NULL),
        '[]'
    )::json AS competencies
FROM category c
LEFT JOIN competency cmp ON c.id = cmp.category_id
GROUP BY c.id, c.name, c.description, c.weight
ORDER BY c.name ASC;