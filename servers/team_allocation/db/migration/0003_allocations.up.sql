BEGIN;

CREATE TABLE
    allocations (
        id UUID NOT NULL PRIMARY KEY,
        course_participation_id UUID NOT NULL,
        team_id UUID NOT NULL,
        course_phase_id UUID NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        -- still enforce that team_id itself exists...
        FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE,
        -- …and also enforce that the phase matches the one on the team:
        FOREIGN KEY (team_id, course_phase_id) REFERENCES team (id, course_phase_id) ON DELETE CASCADE,
        UNIQUE (course_participation_id, team_id)
    );

COMMIT;