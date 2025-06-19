BEGIN;

ALTER TABLE assessment_template_course_phase
    RENAME TO course_phase_config;

ALTER TABLE course_phase_config
    ADD COLUMN deadline TIMESTAMPTZ NULL DEFAULT NULL;

CREATE OR REPLACE VIEW category_course_phase AS
SELECT c.id AS category_id,
       cpc.course_phase_id
FROM category c
         INNER JOIN course_phase_config cpc
                    ON c.assessment_template_id = cpc.assessment_template_id;

COMMIT;