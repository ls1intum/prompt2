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