BEGIN;

ALTER TABLE course_phase_type
ADD COLUMN required_input_meta_data jsonb DEFAULT '[]' NOT NULL,
ADD COLUMN provided_output_meta_data jsonb DEFAULT '[]' NOT NULL,
ADD COLUMN initial_phase BOOLEAN DEFAULT FALSE NOT NULL;

COMMIT;