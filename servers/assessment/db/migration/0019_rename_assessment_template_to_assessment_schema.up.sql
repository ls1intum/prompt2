BEGIN;

-- Drop existing foreign key constraints before renaming columns
ALTER TABLE category
    DROP CONSTRAINT IF EXISTS category_assessment_template_id_fkey;

ALTER TABLE course_phase_config
    DROP CONSTRAINT IF EXISTS course_phase_config_assessment_template_id_fkey,
    DROP CONSTRAINT IF EXISTS course_phase_config_self_evaluation_template_fkey,
    DROP CONSTRAINT IF EXISTS course_phase_config_peer_evaluation_template_fkey,
    DROP CONSTRAINT IF EXISTS course_phase_config_tutor_evaluation_template_fkey;

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

-- Recreate foreign key constraints with new column and table names
ALTER TABLE category
    ADD CONSTRAINT category_assessment_schema_id_fkey
        FOREIGN KEY (assessment_schema_id) REFERENCES assessment_schema (id) ON DELETE CASCADE;

ALTER TABLE course_phase_config
    ADD CONSTRAINT course_phase_config_assessment_schema_id_fkey
        FOREIGN KEY (assessment_schema_id) REFERENCES assessment_schema (id) ON DELETE RESTRICT,
    ADD CONSTRAINT course_phase_config_self_evaluation_schema_fkey
        FOREIGN KEY (self_evaluation_schema) REFERENCES assessment_schema (id) ON DELETE RESTRICT,
    ADD CONSTRAINT course_phase_config_peer_evaluation_schema_fkey
        FOREIGN KEY (peer_evaluation_schema) REFERENCES assessment_schema (id) ON DELETE RESTRICT,
    ADD CONSTRAINT course_phase_config_tutor_evaluation_schema_fkey
        FOREIGN KEY (tutor_evaluation_schema) REFERENCES assessment_schema (id) ON DELETE RESTRICT;

-- Recreate the view with updated column names
DROP VIEW IF EXISTS category_course_phase;
CREATE VIEW category_course_phase AS
SELECT c.id AS category_id,
       cpc.course_phase_id
FROM category c
         INNER JOIN course_phase_config cpc
                    ON c.assessment_schema_id = cpc.assessment_schema_id;

COMMIT;
