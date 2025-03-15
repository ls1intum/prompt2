-- Migration: Rename existing tables to the participation variant and add new phase variant tables

BEGIN;

-- Rename existing DTO tables to use the "participation" prefix
ALTER TABLE course_phase_type_provided_output_dto 
    RENAME TO course_phase_type_participation_provided_output_dto;

ALTER TABLE course_phase_type_required_input_dto 
    RENAME TO course_phase_type_participation_required_input_dto;

-- Rename the dependency graph table to "participation_data_dependency_graph"
ALTER TABLE meta_data_dependency_graph 
    RENAME TO participation_data_dependency_graph;

--------------------------------------------------
-- Create new tables for the "phase" variant
--------------------------------------------------

-- Provided Output DTO table for phases
CREATE TABLE course_phase_type_phase_provided_output_dto (
    id                      uuid PRIMARY KEY, 
    course_phase_type_id    uuid        NOT NULL,
    dto_name                text        NOT NULL,
    version_number          integer     NOT NULL,
    endpoint_path           text        NOT NULL,
    specification           jsonb       NOT NULL,
    CONSTRAINT fk_course_phase_type_phase_provided
      FOREIGN KEY (course_phase_type_id)
      REFERENCES course_phase_type_phase(id)  -- adjust if needed
      ON DELETE CASCADE
);

-- Required Input DTO table for phases
CREATE TABLE course_phase_type_phase_required_input_dto (
    id                      uuid PRIMARY KEY,
    course_phase_type_id    uuid NOT NULL,
    dto_name                text NOT NULL,
    specification           jsonb NOT NULL,
    CONSTRAINT fk_course_phase_type_phase_required
      FOREIGN KEY (course_phase_type_id)
      REFERENCES course_phase_type_phase(id)  -- adjust if needed
      ON DELETE CASCADE
);

-- Dependency graph table for phases
CREATE TABLE phase_data_dependency_graph (
  from_course_phase_id         uuid NOT NULL,
  to_course_phase_id           uuid NOT NULL,
  from_course_phase_DTO_id     uuid NOT NULL,
  to_course_phase_DTO_id       uuid NOT NULL,
  PRIMARY KEY (to_course_phase_id, to_course_phase_DTO_id),
  CONSTRAINT fk_from_phase_phase
    FOREIGN KEY (from_course_phase_id) REFERENCES course_phase(id) ON DELETE CASCADE,
  CONSTRAINT fk_to_phase_phase
    FOREIGN KEY (to_course_phase_id) REFERENCES course_phase(id) ON DELETE CASCADE,
  CONSTRAINT fk_from_dto_phase
    FOREIGN KEY (from_course_phase_DTO_id)
    REFERENCES course_phase_type_phase_provided_output_dto(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_to_dto_phase
    FOREIGN KEY (to_course_phase_DTO_id)
    REFERENCES course_phase_type_phase_required_input_dto(id)
    ON DELETE CASCADE
);

COMMIT;
