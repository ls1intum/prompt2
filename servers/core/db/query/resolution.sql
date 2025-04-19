-- name: GetLocalResolution :one
SELECT cpt.local_url
FROM course_phase_type cpt
JOIN course_phase cp ON cp.type = cpt.id
WHERE cp.id = $1;