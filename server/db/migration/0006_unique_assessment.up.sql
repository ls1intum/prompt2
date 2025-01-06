BEGIN;

ALTER TABLE application_assessment
ADD CONSTRAINT unique_course_phase_participation_assessment
UNIQUE (course_phase_participation_id);

COMMIT;
