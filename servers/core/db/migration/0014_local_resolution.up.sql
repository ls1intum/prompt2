BEGIN;

ALTER TABLE course_phase_type
ADD COLUMN local_url text;

COMMIT;