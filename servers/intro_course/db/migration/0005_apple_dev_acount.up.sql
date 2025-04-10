CREATE TABLE student_apple_processes (
  course_phase_id UUID NOT NULL,
  course_participation_id UUID NOT NULL,
  apple_success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (course_phase_id, course_participation_id)
);

