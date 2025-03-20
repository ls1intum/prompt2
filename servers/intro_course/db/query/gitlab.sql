-- name: AddGitlabStatus :exec
INSERT INTO student_gitlab_processes (course_phase_id, course_participation_id, gitlab_success)
VALUES ($1, $2, true)
ON CONFLICT (course_phase_id, course_participation_id)
DO UPDATE SET 
    gitlab_success = EXCLUDED.gitlab_success,
    updated_at = CURRENT_TIMESTAMP;