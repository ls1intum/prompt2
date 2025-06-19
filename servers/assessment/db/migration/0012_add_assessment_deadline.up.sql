BEGIN;

ALTER TABLE assessment_template_course_phase
    RENAME TO course_phase_info;

ALTER TABLE course_phase_info
    ADD COLUMN deadline TIMESTAMPTZ NULL DEFAULT NULL;

CREATE OR REPLACE VIEW category_course_phase AS
SELECT c.id AS category_id,
       cpi.course_phase_id
FROM category c
         INNER JOIN course_phase_info cpi
                    ON c.assessment_template_id = cpi.assessment_template_id;

COMMIT;