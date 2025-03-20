BEGIN;

ALTER TABLE tutor
  ADD COLUMN gitlab_username text;

CREATE TABLE student_gitlab_processes (
    course_phase_id uuid NOT NULL,
    course_participation_id uuid NOT NULL,
    gitlab_success BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_phase_id, course_participation_id)
);

COMMIT;
