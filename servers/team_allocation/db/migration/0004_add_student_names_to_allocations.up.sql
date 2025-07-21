BEGIN;

ALTER TABLE allocations
ADD COLUMN student_first_name TEXT NOT NULL DEFAULT '';

ALTER TABLE allocations
ADD COLUMN student_last_name TEXT NOT NULL DEFAULT '';

COMMIT;