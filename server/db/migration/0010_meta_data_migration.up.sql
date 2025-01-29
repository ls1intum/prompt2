BEGIN;

-- 1) Adjust course
ALTER TABLE course
RENAME COLUMN meta_data TO restricted_data;

ALTER TABLE course
ADD COLUMN student_readable_data jsonb;

-- 2) Adjust course_phase
ALTER TABLE course_phase
RENAME COLUMN meta_data TO restricted_data;

ALTER TABLE course_phase
ADD COLUMN student_readable_data jsonb;

-- 3) Adjust course_phase_participation
ALTER TABLE course_phase_participation
RENAME COLUMN meta_data TO restricted_data;

ALTER TABLE course_phase_participation
ADD COLUMN student_readable_data jsonb;



-- 3) Populate student_readable_data with icon and bg-color from restricted_meta_data
UPDATE course
SET student_readable_data = jsonb_build_object(
  'icon', restricted_data->>'icon',
  'bg-color', restricted_data->>'bg-color'
);

COMMIT;