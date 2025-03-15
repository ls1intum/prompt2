-- name: GetParticipationDataGraph :many
SELECT mg.*
FROM participation_data_dependency_graph mg
JOIN course_phase cp
  ON mg.from_course_phase_id = cp.id
WHERE cp.course_id = $1;

-- name: DeleteParticipationDataGraphConnections :exec
DELETE FROM participation_data_dependency_graph
WHERE from_course_phase_id IN 
    (SELECT id FROM course_phase WHERE course_id = $1);

-- name: CreateParticipationDataConnection :exec
INSERT INTO participation_data_dependency_graph (from_course_phase_id, to_course_phase_id, from_course_phase_DTO_id, to_course_phase_DTO_id)
VALUES ($1, $2, $3, $4);

-- name: GetPhaseDataGraph :many
SELECT mg.*
FROM phase_data_dependency_graph mg
JOIN course_phase cp
  ON mg.from_course_phase_id = cp.id
WHERE cp.course_id = $1;

-- name: DeletePhaseDataGraphConnections :exec
DELETE FROM phase_data_dependency_graph
WHERE from_course_phase_id IN 
    (SELECT id FROM course_phase WHERE course_id = $1);

-- name: CreatePhaseDataConnection :exec
INSERT INTO phase_data_dependency_graph (from_course_phase_id, to_course_phase_id, from_course_phase_DTO_id, to_course_phase_DTO_id)
VALUES ($1, $2, $3, $4);