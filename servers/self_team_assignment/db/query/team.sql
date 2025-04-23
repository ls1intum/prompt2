-- name: GetTeamsByCoursePhase :many
SELECT *
FROM team
WHERE course_phase_id = $1
ORDER BY name;

-- name: GetTeamsWithStudentNames :many
SELECT
    t.*,
    ARRAY_AGG(a.student_full_name ORDER BY a.student_full_name)::text[] AS student_names
FROM
    team t
LEFT JOIN
    assignments a ON t.id = a.team_id
WHERE
    t.course_phase_id = $1
GROUP BY
    t.id
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