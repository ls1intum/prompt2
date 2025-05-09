CREATE TABLE
  student_apple_processes (
    course_phase_id UUID NOT NULL,
    course_participation_id UUID NOT NULL,
    apple_success BOOLEAN NOT NULL DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_phase_id, course_participation_id)
  );