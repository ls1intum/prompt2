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

COMMIT;