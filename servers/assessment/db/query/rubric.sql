-- name: GetRubricsForCompetency :many
SELECT id, competency_id, level, description
FROM rubric
WHERE competency_id = $1
ORDER BY level;

-- name: InsertRubric :exec
INSERT INTO rubric (id, competency_id, level, description)
VALUES ($1, $2, $3, $4);

-- name: UpdateRubric :exec
UPDATE rubric
SET level = $2,
    description = $3
WHERE id = $1;

-- name: DeleteRubric :exec
DELETE FROM rubric
WHERE id = $1;