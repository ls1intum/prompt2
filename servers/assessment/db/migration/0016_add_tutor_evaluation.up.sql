BEGIN;

ALTER TABLE course_phase_config
    ADD COLUMN tutor_evaluation_enabled  BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN tutor_evaluation_start    TIMESTAMP WITH TIME ZONE,
    ADD COLUMN tutor_evaluation_deadline TIMESTAMP WITH TIME ZONE,
    ADD COLUMN tutor_evaluation_template uuid;

CREATE TYPE assessment_type AS ENUM (
    'self',
    'peer',
    'tutor',
    'assessment'
    );

ALTER TABLE evaluation
    ADD COLUMN type assessment_type NOT NULL DEFAULT 'self';
UPDATE evaluation
SET type = 'peer'
WHERE course_participation_id != author_course_participation_id;

ALTER TABLE evaluation_completion
    ADD COLUMN type assessment_type NOT NULL DEFAULT 'self';
UPDATE evaluation_completion
SET type = 'peer'
WHERE course_participation_id != author_course_participation_id;

ALTER TABLE feedback_items
    ADD COLUMN type assessment_type NOT NULL DEFAULT 'self';
UPDATE feedback_items
SET type = 'peer'
WHERE course_participation_id != author_course_participation_id;

INSERT INTO assessment_template (id, name, description)
VALUES (gen_random_uuid(), 'Tutor Evaluation Template', 'This is the default tutor evaluation template.');

DO
$$
    DECLARE
        tutor_uuid uuid;
    BEGIN
        SELECT id INTO tutor_uuid FROM assessment_template WHERE name = 'Tutor Evaluation Template';
        IF tutor_uuid IS NULL THEN
            RAISE EXCEPTION 'Tutor Evaluation Template not found';
        END IF;
        UPDATE course_phase_config
        SET tutor_evaluation_template = tutor_uuid,
            tutor_evaluation_start    = CURRENT_DATE,
            tutor_evaluation_deadline = CURRENT_DATE;
        EXECUTE format('ALTER TABLE course_phase_config ALTER COLUMN tutor_evaluation_template SET DEFAULT %L',
                       tutor_uuid);
    END
$$;

ALTER TABLE course_phase_config
    ALTER COLUMN tutor_evaluation_template SET NOT NULL,
    ADD FOREIGN KEY (tutor_evaluation_template) REFERENCES assessment_template (id) ON DELETE RESTRICT;

COMMIT;