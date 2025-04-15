BEGIN;

CREATE TABLE allocations (
    id uuid NOT NULL PRIMARY KEY,
    course_participation_id uuid NOT NULL,
    team_id uuid NOT NULL,
    course_phase_id uuid NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_participation_id) REFERENCES course_participation(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
    FOREIGN KEY (course_phase_id) REFERENCES course_phase(id) ON DELETE CASCADE,
    
    -- Ensure that a student can only be allocated to one team per course phase
    CONSTRAINT unique_allocation UNIQUE (course_participation_id, course_phase_id)
);

COMMIT;
