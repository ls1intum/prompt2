-- name: AddGitlabStatus :exec
INSERT INTO student_gitlab_processes (course_phase_id, course_participation_id, gitlab_success)
VALUES ($1, $2, true)
ON CONFLICT (course_phase_id, course_participation_id)
DO UPDATE SET 
    gitlab_success = EXCLUDED.gitlab_success,
    updated_at = CURRENT_TIMESTAMP,
    error_message = NULL;

-- name: AddGitlabError :exec
INSERT INTO student_gitlab_processes (course_phase_id, course_participation_id, gitlab_success, error_message)
VALUES ($1, $2, false, $3)
ON CONFLICT (course_phase_id, course_participation_id)
DO UPDATE SET 
    gitlab_success = EXCLUDED.gitlab_success,
    error_message = EXCLUDED.error_message,
    updated_at = CURRENT_TIMESTAMP;


-- name: GetAllGitlabStatus :many
SELECT * FROM student_gitlab_processes WHERE course_phase_id = $1;