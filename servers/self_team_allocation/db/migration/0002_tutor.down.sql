BEGIN;

DROP TABLE IF EXISTS tutor;

-- Add back the old column
ALTER TABLE assignments
    ADD COLUMN student_full_name TEXT NOT NULL DEFAULT '';

-- Try to restore data by concatenating first and last name
UPDATE assignments
SET student_full_name = TRIM(COALESCE(student_first_name, '') || ' ' || COALESCE(student_last_name, ''))
WHERE student_first_name IS NOT NULL OR student_last_name IS NOT NULL;

-- Drop the new columns
ALTER TABLE assignments
    DROP COLUMN student_first_name,
    DROP COLUMN student_last_name;

COMMIT;
