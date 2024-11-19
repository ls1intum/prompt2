-- name: GetCoursePhaseSequence :many
WITH RECURSIVE phase_sequence AS (
    SELECT cp.*, 1 AS sequence_order
    FROM course_phase cp
    WHERE cp.course_id = $1 AND cp.is_initial_phase = true

    UNION ALL

    SELECT cp.*, ps.sequence_order + 1 AS sequence_order
    FROM course_phase cp
    INNER JOIN course_phase_graph g ON g.to_course_phase_id = cp.id
    INNER JOIN phase_sequence ps ON g.from_course_phase_id = ps.id
)
SELECT *
FROM phase_sequence
ORDER BY sequence_order;

-- name: GetNotOrderedCoursePhases :many
SELECT cp.*
FROM course_phase cp
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