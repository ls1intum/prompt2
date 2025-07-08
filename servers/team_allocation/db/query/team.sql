-- name: GetTeamsByCoursePhase :many
SELECT *
FROM team
WHERE course_phase_id = $1
ORDER BY name;


-- name: GetTeamByCoursePhaseAndTeamID :one
SELECT *
FROM team
WHERE id = $1
AND course_phase_id = $2; -- ensuring to get only teams in the authenticated course_phase

-- name: CreateTeam :exec
INSERT INTO team (id, name, course_phase_id)
VALUES ($1, $2, $3);

-- name: UpdateTeam :exec
UPDATE team
SET name = $3
WHERE id = $1
AND course_phase_id = $2; -- ensuring to update only teams in the authenticated course_phase

-- name: DeleteTeam :exec
DELETE FROM team
WHERE id = $1
AND course_phase_id = $2; -- ensuring to delete only teams in the authenticated course_phase

-- name: GetAllocationsWithStudentNames :many
SELECT
  t.id,
  t.name,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'courseParticipationID', a.course_participation_id,
        'studentName',           a.student_full_name
      )
      ORDER BY a.student_full_name
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::jsonb
  )::jsonb AS team_members
FROM
  team t
LEFT JOIN
  allocations a
  ON t.id = a.team_id
WHERE
  t.course_phase_id = $1
GROUP BY
  t.id, t.name
ORDER BY
  t.name;

-- name: GetAllocationsWithStudentNamesByID :one
SELECT
  t.id,
  t.name,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'courseParticipationID', a.course_participation_id,
        'studentName',           a.student_full_name
      )
      ORDER BY a.student_full_name
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::jsonb
  )::jsonb AS team_members
FROM
  team t
LEFT JOIN
  allocations a
  ON t.id = a.team_id
WHERE
  t.id = $1
GROUP BY
  t.id, t.name;

-- name: GetAllocationWithStudentNamesByTeamID :one
SELECT
  t.id,
  t.name,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'courseParticipationID', a.course_participation_id,
        'studentName',           a.student_full_name
      )
      ORDER BY a.student_full_name
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::jsonb
  )::jsonb AS team_members
FROM
  team t
LEFT JOIN
  allocations a
  ON t.id = a.team_id
WHERE
  t.course_phase_id = $1
  AND t.id = $2
GROUP BY
  t.id, t.name
ORDER BY
  t.name;
