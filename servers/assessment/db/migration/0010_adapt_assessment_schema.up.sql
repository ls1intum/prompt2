BEGIN;

ALTER TABLE assessment
    ADD COLUMN examples text DEFAULT '' NOT NULL;

ALTER TABLE assessment_completion
    ADD COLUMN comment          text          DEFAULT ''    NOT NULL,
    ADD COLUMN grade_suggestion numeric(2, 1) DEFAULT 6.0   NOT NULL,
    ADD COLUMN completed        boolean       DEFAULT false NOT NULL;

CREATE TABLE action_item
(
    id                     uuid      NOT NULL PRIMARY KEY,
    course_phase_id         uuid      NOT NULL,
    course_participation_id uuid      NOT NULL,
    action                  text      NOT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    author                  text      NOT NULL
);

COMMIT;