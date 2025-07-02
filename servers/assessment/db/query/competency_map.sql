-- name: CreateCompetencyMap :exec
INSERT INTO competency_map (from_competency_id, to_competency_id)
VALUES ($1, $2);

-- name: DeleteCompetencyMap :exec
DELETE FROM competency_map
WHERE from_competency_id = $1 AND to_competency_id = $2;

-- name: GetEvaluationsByMappedCompetency :many
SELECT e.*
FROM evaluation e
JOIN competency_map cm ON e.competency_id = cm.from_competency_id
WHERE cm.to_competency_id = $1;

-- name: GetCompetencyMappings :many
SELECT *
FROM competency_map
WHERE from_competency_id = $1;

-- name: GetAllCompetencyMappings :many
SELECT *
FROM competency_map;

-- name: GetReverseCompetencyMappings :many
SELECT *
FROM competency_map
WHERE to_competency_id = $1;
