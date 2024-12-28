BEGIN;

-- Drop the existing uniqueness constraints
ALTER TABLE student DROP CONSTRAINT IF EXISTS student_matriculation_number_key;
ALTER TABLE student DROP CONSTRAINT IF EXISTS student_university_login_key;

-- Add new partial unique indexes to enforce uniqueness only for non-null and non-empty values
CREATE UNIQUE INDEX student_matriculation_number_unique 
ON student (matriculation_number)
WHERE matriculation_number IS NOT NULL AND matriculation_number <> '';

CREATE UNIQUE INDEX student_university_login_unique 
ON student (university_login)
WHERE university_login IS NOT NULL AND university_login <> '';

COMMIT;
