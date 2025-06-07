-- name: GetActionItem :one
SELECT *
FROM action_item
WHERE id = $1;

-- name: CreateActionItem :exec
INSERT INTO action_item (id,
                         course_phase_id,
                         course_participation_id,
                         action,
                         author)
VALUES ($1, $2, $3, $4, $5);

-- name: UpdateActionItem :exec
UPDATE action_item
SET course_phase_id         = $2,
    course_participation_id = $3,
    action                  = $4,
    author                  = $5
WHERE id = $1;

-- name: DeleteActionItem :exec
DELETE
FROM action_item
WHERE id = $1;

-- name: ListActionItemsForStudentInPhase :many
SELECT *
FROM action_item
WHERE course_participation_id = $1
  AND course_phase_id = $2;

