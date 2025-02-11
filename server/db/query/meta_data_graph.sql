-- name: GetMetaDataGraph :many
SELECT mg.*
FROM meta_data_dependency_graph mg
JOIN course_phase cp
  ON mg.from_phase_id = cp.id
WHERE cp.course_id = $1;

-- name: DeleteMetaDataGraphConnections :exec
DELETE FROM meta_data_dependency_graph
WHERE from_phase_id IN 
    (SELECT id FROM course_phase WHERE course_id = $1);

-- TODO: adjust to new schema 
-- name: CreateMetaDataConnection :exec
INSERT INTO meta_data_dependency_graph (from_course_phase_id, to_course_phase_id)
VALUES ($1, $2);