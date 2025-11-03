BEGIN;

CREATE TABLE
    tutor
(
    course_phase_id         uuid NOT NULL,
    course_participation_id uuid NOT NULL,
    first_name              text NOT NULL,
    last_name               text NOT NULL,
    team_id                 uuid NOT NULL,
    PRIMARY KEY (course_phase_id, course_participation_id),
    FOREIGN KEY (team_id, course_phase_id) REFERENCES team (id, course_phase_id) ON DELETE CASCADE
);

-- Add new columns first
ALTER TABLE assignments
    ADD COLUMN student_first_name TEXT NOT NULL DEFAULT '',
    ADD COLUMN student_last_name  TEXT NOT NULL DEFAULT '';

UPDATE assignments
SET student_first_name = COALESCE(SPLIT_PART(student_full_name, ' ', 1), ''),
    student_last_name = COALESCE(TRIM(SUBSTRING(student_full_name FROM POSITION(' ' IN student_full_name) + 1)), '')
WHERE student_full_name IS NOT NULL AND student_full_name != '';

-- Now drop the old column
ALTER TABLE assignments
    DROP COLUMN student_full_name;

COMMIT;
