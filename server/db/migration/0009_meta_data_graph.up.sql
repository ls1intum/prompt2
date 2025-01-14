BEGIN;

-- Add a “dependencies” table that says:
CREATE TABLE meta_data_dependency_graph (
    from_phase_id uuid NOT NULL,
    to_phase_id   uuid NOT NULL,
    PRIMARY KEY (from_phase_id, to_phase_id),
    CONSTRAINT fk_from_phase
      FOREIGN KEY (from_phase_id) REFERENCES course_phase(id) ON DELETE CASCADE,
    CONSTRAINT fk_to_phase
      FOREIGN KEY (to_phase_id) REFERENCES course_phase(id) ON DELETE CASCADE
);

-- Add new fields to application_question_text
ALTER TABLE application_question_text
ADD COLUMN accessible_for_other_phases boolean DEFAULT false,
ADD COLUMN access_key VARCHAR(50) DEFAULT '';

-- Add new fields to application_question_multi_select
ALTER TABLE application_question_multi_select
ADD COLUMN accessible_for_other_phases boolean DEFAULT false,
ADD COLUMN access_key VARCHAR(50) DEFAULT '';


COMMIT;