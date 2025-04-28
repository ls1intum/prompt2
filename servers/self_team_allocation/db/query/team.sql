-- name: GetTeamsByCoursePhase :many
SELECT *
FROM team
WHERE course_phase_id = $1
ORDER BY name;

-- name: GetTeamsWithStudentNames :many
SELECT
  t.id,
  t.name,
  -- build a JSON array of {courseParticipationID, studentName}
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
  assignments a
  ON t.id = a.team_id
WHERE
  t.course_phase_id = $1
GROUP BY
  t.id, t.name
ORDER BY
  t.name;

-- name: GetTeamWithStudentNamesByID :one
SELECT
  t.id,
  t.name,
  -- build a JSON array of {courseParticipationID, studentName}
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
  assignments a
  ON t.id = a.team_id
WHERE
  t.id = $1
GROUP BY
  t.id, t.name;

-- name: GetTeamWithStudentNamesByTeamID :one
SELECT
  t.id,
  t.name,
  -- build a JSON array of {courseParticipationID, studentName}
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
  assignments a
  ON t.id = a.team_id
WHERE
  t.course_phase_id = $1
  AND t.id = $2
GROUP BY
  t.id, t.name
ORDER BY
  t.name;


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