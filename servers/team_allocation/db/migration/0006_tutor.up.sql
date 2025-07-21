BEGIN;

CREATE TABLE
    tutor
(
    course_phase_id         uuid NOT NULL,
    course_participation_id uuid NOT NULL,
    first_name              text NOT NULL,
    last_name               text NOT NULL,
    team_id                 uuid,
    PRIMARY KEY (course_phase_id, course_participation_id),
    FOREIGN KEY (team_id, course_phase_id) REFERENCES team (id, course_phase_id) ON DELETE CASCADE
);

ALTER TABLE allocations
    DROP COLUMN student_full_name,
    ADD COLUMN student_first_name TEXT NOT NULL DEFAULT '',
    ADD COLUMN student_last_name  TEXT NOT NULL DEFAULT '';

COMMIT;