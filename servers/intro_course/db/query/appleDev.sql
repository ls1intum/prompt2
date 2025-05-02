-- name: AddAppleError :exec
INSERT INTO student_apple_processes (course_phase_id, course_participation_id, apple_success, error_message)
VALUES ($1, $2, false, $3)
ON CONFLICT (course_phase_id, course_participation_id)
DO UPDATE SET 
  apple_success = EXCLUDED.apple_success,
  error_message = EXCLUDED.error_message,
  updated_at = CURRENT_TIMESTAMP;

-- name: AddAppleStatus :exec
INSERT INTO student_apple_processes (course_phase_id, course_participation_id, apple_success)
VALUES ($1, $2, true)
ON CONFLICT (course_phase_id, course_participation_id)
DO UPDATE SET 
  apple_success = EXCLUDED.apple_success,
  error_message = NULL,
  updated_at = CURRENT_TIMESTAMP;

-- name: GetAllAppleStatus :many
SELECT * FROM student_apple_processes WHERE course_phase_id = $1;

-- name: GetAppleStatus :one
SELECT * FROM student_apple_processes WHERE course_phase_id = $1 AND course_participation_id = $2;