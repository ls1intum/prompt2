BEGIN;

CREATE TYPE study_degree AS ENUM (
  'bachelor',
  'master'
);

ALTER TABLE student
ADD COLUMN study_program varchar(100),
ADD COLUMN study_degree study_degree NOT NULL DEFAULT 'bachelor',
ADD COLUMN current_semester int,
ADD COLUMN last_modified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE course_phase_participation
ADD COLUMN last_modified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;


-- Create the function to update the last_modified column
CREATE OR REPLACE FUNCTION update_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update last_modified
CREATE TRIGGER set_last_modified_student
BEFORE UPDATE ON student
FOR EACH ROW
EXECUTE FUNCTION update_last_modified_column();

CREATE TRIGGER set_last_modified_course_phase_participation
BEFORE UPDATE ON course_phase_participation
FOR EACH ROW
EXECUTE FUNCTION update_last_modified_column();


COMMIT;