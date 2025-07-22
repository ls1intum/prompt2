-- name: GetTeamsByCoursePhase :many
SELECT *
FROM team
WHERE course_phase_id = $1
ORDER BY name;


-- name: GetTeamByCoursePhaseAndTeamID :one
-- ensuring to get only teams in the authenticated course_phase
SELECT *
FROM team
WHERE id = $1
  AND course_phase_id = $2;

-- name: CreateTeam :exec
INSERT INTO team (id, name, course_phase_id)
VALUES ($1, $2, $3);

-- name: UpdateTeam :exec
-- ensuring to update only teams in the authenticated course_phase
UPDATE team
SET name = $3
WHERE id = $1
  AND course_phase_id = $2;

-- name: DeleteTeam :exec
-- ensuring to delete only teams in the authenticated course_phase
DELETE
FROM team
WHERE id = $1
  AND course_phase_id = $2;

-- name: GetTeamsWithMembers :many
SELECT t.id,
       t.name,
       COALESCE(
                       jsonb_agg(
                       jsonb_build_object(
                               'courseParticipationID', a.course_participation_id,
                               'firstName', a.student_first_name,
                               'lastName', a.student_last_name
                       )
                       ORDER BY a.student_first_name
                                ) FILTER (WHERE a.id IS NOT NULL),
                       '[]'::jsonb
       )::jsonb AS team_members,
       COALESCE(
                       jsonb_agg(
                       jsonb_build_object(
                               'courseParticipationID', tu.course_participation_id,
                               'firstName', tu.first_name,
                               'lastName', tu.last_name
                       )
                       ORDER BY tu.first_name
                                ) FILTER (WHERE tu.course_participation_id IS NOT NULL),
                       '[]'::jsonb
       )::jsonb AS team_tutors
FROM team t
         LEFT JOIN
     allocations a
     ON t.id = a.team_id
         LEFT JOIN tutor tu
                   ON t.id = tu.team_id
WHERE t.course_phase_id = $1
GROUP BY t.id, t.name
ORDER BY t.name;

-- name: GetTeamWithMembersByTeamID :one
SELECT t.id,
       t.name,
       COALESCE(
                       jsonb_agg(
                       jsonb_build_object(
                               'courseParticipationID', a.course_participation_id,
                               'firstName', a.student_first_name,
                               'lastName', a.student_last_name
                       )
                       ORDER BY a.student_first_name
                                ) FILTER (WHERE a.id IS NOT NULL),
                       '[]'::jsonb
       )::jsonb AS team_members,
       COALESCE(
                       jsonb_agg(
                       jsonb_build_object(
                               'courseParticipationID', tu.course_participation_id,
                               'firstName', tu.first_name,
                               'lastName', tu.last_name
                       )
                       ORDER BY tu.first_name
                                ) FILTER (WHERE tu.course_participation_id IS NOT NULL),
                       '[]'::jsonb
       )::jsonb AS team_tutors
FROM team t
         LEFT JOIN
     allocations a
     ON t.id = a.team_id
         LEFT JOIN tutor tu
                   ON t.id = tu.team_id
WHERE t.course_phase_id = $1
  AND t.id = $2
GROUP BY t.id, t.name
ORDER BY t.name;
