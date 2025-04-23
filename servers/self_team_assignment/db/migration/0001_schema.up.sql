BEGIN;

CREATE TABLE team (
    id uuid NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course_phase_id uuid NOT NULL,
    creator_course_participation_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_phase_team UNIQUE (course_phase_id, name),
    CONSTRAINT team_id_course_phase_uk UNIQUE (id, course_phase_id)
);

CREATE TABLE assignments (
    id UUID NOT NULL PRIMARY KEY,
    course_participation_id UUID NOT NULL,
    student_full_name TEXT NOT NULL,
    team_id UUID NOT NULL,
    course_phase_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- still enforce that team_id itself exists...
    FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE,
    -- …and also enforce that the phase matches the one on the team:
    FOREIGN KEY (team_id, course_phase_id) REFERENCES team (id, course_phase_id) ON DELETE CASCADE,
    CONSTRAINT assignments_participation_phase_uk UNIQUE (course_participation_id, course_phase_id)
);


COMMIT;
