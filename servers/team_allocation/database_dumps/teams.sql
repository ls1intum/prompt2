-- Teams table test data
BEGIN;

-- Schema for teams
CREATE TABLE IF NOT EXISTS team (
    id uuid NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course_phase_id uuid NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_phase_team UNIQUE (course_phase_id, name),
    CONSTRAINT team_id_course_phase_uk UNIQUE (id, course_phase_id)
);

CREATE TABLE IF NOT EXISTS allocations (
    id UUID NOT NULL PRIMARY KEY,
    course_participation_id UUID NOT NULL,
    team_id UUID NOT NULL,
    course_phase_id UUID NOT NULL,
    student_full_name TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE,
    FOREIGN KEY (team_id, course_phase_id) REFERENCES team (id, course_phase_id) ON DELETE CASCADE,
    CONSTRAINT allocations_participation_phase_uk UNIQUE (course_participation_id, course_phase_id)
);

-- Test data
INSERT INTO team (id, name, course_phase_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Team Alpha', '4179d58a-d00d-4fa7-94a5-397bc69fab02'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Team Beta', '4179d58a-d00d-4fa7-94a5-397bc69fab02'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Team Gamma', '4179d58a-d00d-4fa7-94a5-397bc69fab02'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Team Delta', '5179d58a-d00d-4fa7-94a5-397bc69fab03');

-- Sample allocations for team tests
INSERT INTO allocations (id, course_participation_id, team_id, course_phase_id, student_full_name) VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '99999999-9999-9999-9999-999999999991', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '4179d58a-d00d-4fa7-94a5-397bc69fab02', 'John Doe'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '99999999-9999-9999-9999-999999999992', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4179d58a-d00d-4fa7-94a5-397bc69fab02', 'Jane Smith');

COMMIT;
