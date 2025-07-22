BEGIN;

ALTER TABLE course_phase_config
    ADD COLUMN tutor_evaluation_enabled  BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN tutor_evaluation_start    TIMESTAMP WITH TIME ZONE,
    ADD COLUMN tutor_evaluation_deadline TIMESTAMP WITH TIME ZONE;

CREATE TYPE evaluation_type AS ENUM (
    'self',
    'peer',
    'tutor'
    );

ALTER TABLE evaluation
    ADD COLUMN type evaluation_type NOT NULL DEFAULT 'self';
UPDATE evaluation
SET type = 'peer'
WHERE course_participation_id != author_course_participation_id;

ALTER TABLE evaluation_completion
    ADD COLUMN type evaluation_type NOT NULL DEFAULT 'self';
UPDATE evaluation_completion
SET type = 'peer'
WHERE course_participation_id != author_course_participation_id;

ALTER TABLE feedback_items
    ADD COLUMN type evaluation_type NOT NULL DEFAULT 'self';
UPDATE feedback_items
SET type = 'peer'
WHERE course_participation_id != author_course_participation_id;

COMMIT;