BEGIN;

CREATE TABLE competency_map
(
    from_competency_id uuid NOT NULL,
    to_competency_id   uuid NOT NULL,
    FOREIGN KEY (from_competency_id) REFERENCES competency (id) ON DELETE CASCADE,
    FOREIGN KEY (to_competency_id) REFERENCES competency (id) ON DELETE CASCADE,
    PRIMARY KEY (from_competency_id, to_competency_id)
);

CREATE TABLE evaluation
(
    id                             uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    course_participation_id        uuid        NOT NULL,
    course_phase_id                uuid        NOT NULL,
    competency_id                  uuid        NOT NULL,
    score_level                    score_level NOT NULL,
    author_course_participation_id uuid        NOT NULL,
    evaluated_at                   timestamptz NOT NULL             DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competency_id) REFERENCES competency (id) ON DELETE CASCADE,
    UNIQUE (course_participation_id, course_phase_id, competency_id, author_course_participation_id)
);

CREATE TABLE evaluation_completion
(
    id                             uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    course_participation_id        uuid        NOT NULL,
    course_phase_id                uuid        NOT NULL,
    author_course_participation_id uuid        NOT NULL,
    completed_at                   timestamptz NOT NULL,
    completed                      boolean     NOT NULL             DEFAULT false,
    UNIQUE (course_participation_id, course_phase_id, author_course_participation_id)
);

CREATE TYPE feedback_type AS ENUM ('positive', 'negative');

CREATE TABLE feedback_items
(
    id                             uuid          NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_type                  feedback_type NOT NULL,
    feedback_text                  text          NOT NULL,
    course_participation_id        uuid          NOT NULL,
    course_phase_id                uuid          NOT NULL,
    author_course_participation_id uuid          NOT NULL,
    created_at                     timestamptz   NOT NULL             default CURRENT_TIMESTAMP
);

INSERT INTO assessment_template (id, name, description)
VALUES (gen_random_uuid(), 'Self Evaluation Template', 'This is the default self evaluation template.'),
       (gen_random_uuid(), 'Peer Evaluation Template', 'This is the default peer evaluation template.');

ALTER TABLE course_phase_config
    ADD COLUMN self_evaluation_enabled  boolean     NOT NULL DEFAULT false,
    ADD COLUMN self_evaluation_template uuid,
    ADD COLUMN self_evaluation_deadline timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN peer_evaluation_enabled  boolean     NOT NULL DEFAULT false,
    ADD COLUMN peer_evaluation_template uuid,
    ADD COLUMN peer_evaluation_deadline timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO
$$
    DECLARE
        self_uuid uuid;
        peer_uuid uuid;
    BEGIN
        SELECT id INTO self_uuid FROM assessment_template WHERE name = 'Self Evaluation Template';
        IF self_uuid IS NULL THEN
            RAISE EXCEPTION 'Self Evaluation Template not found';
        END IF;
        SELECT id INTO peer_uuid FROM assessment_template WHERE name = 'Peer Evaluation Template';
        IF peer_uuid IS NULL THEN
            RAISE EXCEPTION 'Peer Evaluation Template not found';
        END IF;
        UPDATE course_phase_config
        SET self_evaluation_template = self_uuid,
            peer_evaluation_template = peer_uuid;
        EXECUTE format('ALTER TABLE course_phase_config ALTER COLUMN self_evaluation_template SET DEFAULT %L',
                       self_uuid);
        EXECUTE format('ALTER TABLE course_phase_config ALTER COLUMN peer_evaluation_template SET DEFAULT %L',
                       peer_uuid);
    END
$$;

ALTER TABLE course_phase_config
    ALTER COLUMN self_evaluation_template SET NOT NULL,
    ALTER COLUMN peer_evaluation_template SET NOT NULL,
    ADD FOREIGN KEY (self_evaluation_template) REFERENCES assessment_template (id) ON DELETE RESTRICT,
    ADD FOREIGN KEY (peer_evaluation_template) REFERENCES assessment_template (id) ON DELETE RESTRICT;

COMMIT;
