-- name: GetSkillsByCoursePhase :many
SELECT *
FROM skill
WHERE course_phase_id = $1
ORDER BY name;

-- name: CreateSkill :exec
INSERT INTO skill (id, name, course_phase_id)
VALUES ($1, $2, $3);

-- name: UpdateSkill :exec
UPDATE skill
SET name = $3
WHERE id = $1
AND course_phase_id = $2;

-- name: DeleteSkill :exec
DELETE FROM skill
WHERE id = $1
AND course_phase_id = $2;
