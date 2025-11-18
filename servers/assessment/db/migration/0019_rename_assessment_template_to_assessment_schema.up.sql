BEGIN;

-- Rename the main table from assessment_template to assessment_schema
ALTER TABLE assessment_template
    RENAME TO assessment_schema;

-- Update foreign key column names in the category table
ALTER TABLE category
    RENAME COLUMN assessment_template_id TO assessment_schema_id;

-- Update foreign key column names in the course_phase_config table
ALTER TABLE course_phase_config
    RENAME COLUMN assessment_template_id TO assessment_schema_id;
ALTER TABLE course_phase_config
    RENAME COLUMN self_evaluation_template TO self_evaluation_schema;
ALTER TABLE course_phase_config
    RENAME COLUMN peer_evaluation_template TO peer_evaluation_schema;
ALTER TABLE course_phase_config
    RENAME COLUMN tutor_evaluation_template TO tutor_evaluation_schema;

-- Recreate the view with updated column names
DROP VIEW IF EXISTS category_course_phase;
CREATE VIEW category_course_phase AS
SELECT c.id AS category_id,
       cpc.course_phase_id
FROM category c
         INNER JOIN course_phase_config cpc
                    ON c.assessment_schema_id = cpc.assessment_schema_id;

COMMIT;
