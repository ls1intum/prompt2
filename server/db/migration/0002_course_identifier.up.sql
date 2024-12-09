BEGIN;

-- Add a unique constraint for the combination of course.name and course.semester_tag
ALTER TABLE course
ADD CONSTRAINT unique_course_identifier UNIQUE (name, semester_tag);

-- Add a check constraint to ensure end_date is after start_date
ALTER TABLE course
ADD CONSTRAINT check_end_date_after_start_date CHECK (end_date > start_date);

COMMIT;
