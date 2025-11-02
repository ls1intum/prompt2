BEGIN;

DROP TABLE IF EXISTS tutor;

ALTER TABLE assignments
    ADD COLUMN student_full_name TEXT NOT NULL DEFAULT '',
    DROP COLUMN student_first_name,
    DROP COLUMN student_last_name;

COMMIT;
