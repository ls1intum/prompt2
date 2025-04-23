BEGIN;

CREATE TABLE team (
    id uuid NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course_phase_id uuid NOT NULL,
    creator_course_participation_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_phase_team UNIQUE (course_phase_id, name)
);

COMMIT;
