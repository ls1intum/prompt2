-- name: GetMetaDataGraph :many
SELECT mg.*
FROM meta_data_dependency_graph mg
JOIN course_phase cp
  ON mg.from_phase_id = cp.id
WHERE cp.course_id = $1;

