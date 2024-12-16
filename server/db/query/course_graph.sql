-- name: GetCoursePhaseSequence :many
WITH RECURSIVE phase_sequence AS (
    SELECT cp.id, cp.course_id, cp.name, cp.is_initial_phase, cp.course_phase_type_id, 1 AS sequence_order
    FROM course_phase cp
    WHERE cp.course_id = $1 AND cp.is_initial_phase = true

    UNION ALL

    SELECT cp.id, cp.course_id, cp.name, cp.is_initial_phase, cp.course_phase_type_id, ps.sequence_order + 1 AS sequence_order
    FROM course_phase cp
    INNER JOIN course_phase_graph g ON g.to_course_phase_id = cp.id
    INNER JOIN phase_sequence ps ON g.from_course_phase_id = ps.id
)
SELECT ps.*, cpt.name AS course_phase_type_name
FROM phase_sequence ps
INNER JOIN course_phase_type cpt ON ps.course_phase_type_id = cpt.id
ORDER BY ps.sequence_order;


-- name: GetCoursePhaseGraph :many
SELECT cpg.*
FROM course_phase_graph cpg
JOIN course_phase cp
  ON cpg.from_course_phase_id = cp.id
WHERE cp.course_id = $1;



-- name: GetNotOrderedCoursePhases :many
SELECT cp.*, cpt.name AS course_phase_type_name
FROM course_phase cp
INNER JOIN course_phase_type cpt ON cp.course_phase_type_id = cpt.id
WHERE cp.course_id = $1
  AND cp.is_initial_phase = FALSE
  AND NOT EXISTS (
      SELECT *
      FROM course_phase_graph g
      WHERE g.from_course_phase_id = cp.id
         OR g.to_course_phase_id = cp.id
  );


-- name: DeleteCourseGraph :exec
DELETE FROM course_phase_graph
WHERE from_course_phase_id IN 
    (SELECT id FROM course_phase WHERE course_id = $1);

-- name: CreateCourseGraphConnection :exec
INSERT INTO course_phase_graph (from_course_phase_id, to_course_phase_id)
VALUES ($1, $2);

-- name: UpdateInitialCoursePhase :exec
UPDATE course_phase
SET is_initial_phase = CASE 
    WHEN id = $2 THEN true
    ELSE false
END
WHERE course_id = $1;