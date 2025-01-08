BEGIN;

-- Adding the 'nationality' field to the 'student' table
ALTER TABLE student
ADD COLUMN nationality VARCHAR(2);

COMMIT;