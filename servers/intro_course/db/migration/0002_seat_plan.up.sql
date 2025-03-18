BEGIN;

CREATE TABLE seat (
  course_phase_id uuid NOT NULL,
  seat_name text NOT NULL,
  has_mac boolean NOT NULL DEFAULT false,
  device_id text,
  assigned_student uuid, 
  assigned_tutor uuid,
  PRIMARY KEY (seat_name, course_phase_id),
  CONSTRAINT fk_assigned_tutor
    FOREIGN KEY (course_phase_id, assigned_tutor)
    REFERENCES tutor(course_phase_id, id) ON DELETE SET NULL
);

COMMIT;