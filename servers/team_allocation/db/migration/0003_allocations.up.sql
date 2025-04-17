BEGIN;

CREATE TABLE allocations (
    id uuid NOT NULL PRIMARY KEY,
    course_participation_id uuid NOT NULL,
    team_id uuid NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,

    CONSTRAINT unique_allocation_per_student UNIQUE (course_participation_id)
);

COMMIT;
