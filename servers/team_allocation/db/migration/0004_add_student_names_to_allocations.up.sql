BEGIN;

ALTER TABLE allocations
ADD COLUMN student_full_name TEXT NOT NULL DEFAULT '';

COMMIT;