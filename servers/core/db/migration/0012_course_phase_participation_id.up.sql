BEGIN;

-------------------------------
-- 1. Adjust course_phase_participation
-------------------------------
-- Rename the surrogate primary key column so we can still reference its values.
ALTER TABLE course_phase_participation
  RENAME COLUMN id TO old_id;

-------------------------------
-- 2. Adjust application_answer_text
-------------------------------
-- (a) Add new columns for the composite foreign key.
ALTER TABLE application_answer_text
  ADD COLUMN new_course_participation_id uuid;

-- (b) Populate the new columns using the mapping from course_phase_participation.
UPDATE application_answer_text a
SET new_course_participation_id = cp.course_participation_id
FROM course_phase_participation cp
WHERE a.course_phase_participation_id = cp.old_id;

ALTER TABLE application_answer_text
  ALTER COLUMN new_course_participation_id SET NOT NULL;

-- (c) Drop the old foreign key and unique constraints.
ALTER TABLE application_answer_text
  DROP CONSTRAINT fk_course_phase_participation,
  DROP CONSTRAINT unique_application_answer_text;

-- (d) Remove the old surrogate column.
ALTER TABLE application_answer_text
  DROP COLUMN course_phase_participation_id;

-- (e) Rename the new columns to the desired names.
ALTER TABLE application_answer_text
  RENAME COLUMN new_course_participation_id TO course_participation_id;

-- (f) Add a new foreign key constraint on the composite columns.
ALTER TABLE application_answer_text
  ADD CONSTRAINT fk_course_participation
    FOREIGN KEY (course_participation_id)
    REFERENCES course_participation(id) ON DELETE CASCADE;

-- (g) Recreate a unique constraint that now uses the two foreign key columns.
ALTER TABLE application_answer_text
  ADD CONSTRAINT unique_application_answer_text
    UNIQUE (course_participation_id, application_question_id);

-------------------------------
-- 3. Adjust application_answer_multi_select
-------------------------------
-- (a) Add new columns.
ALTER TABLE application_answer_multi_select
  ADD COLUMN new_course_phase_id uuid,
  ADD COLUMN new_course_participation_id uuid;

-- (b) Populate the new columns.
UPDATE application_answer_multi_select a
SET new_course_phase_id = cp.course_phase_id,
    new_course_participation_id = cp.course_participation_id
FROM course_phase_participation cp
WHERE a.course_phase_participation_id = cp.old_id;

ALTER TABLE application_answer_multi_select
  ALTER COLUMN new_course_phase_id SET NOT NULL,
  ALTER COLUMN new_course_participation_id SET NOT NULL;

-- (c) Drop the old constraints.
ALTER TABLE application_answer_multi_select
  DROP CONSTRAINT fk_course_phase_participation,
  DROP CONSTRAINT unique_application_answer_multi_select;

-- (d) Drop the old column.
ALTER TABLE application_answer_multi_select
  DROP COLUMN course_phase_participation_id;

-- (e) Rename new columns.
ALTER TABLE application_answer_multi_select
  RENAME COLUMN new_course_phase_id TO course_phase_id;

ALTER TABLE application_answer_multi_select
  RENAME COLUMN new_course_participation_id TO course_participation_id;

-- (f) Add the new foreign key.
ALTER TABLE application_answer_multi_select
  ADD CONSTRAINT fk_course_participation
    FOREIGN KEY (course_participation_id)
    REFERENCES course_participation(id) ON DELETE CASCADE;

-- (g) Recreate the unique constraint.
ALTER TABLE application_answer_multi_select
  ADD CONSTRAINT unique_application_answer_multi_select
    UNIQUE (course_participation_id, application_question_id);

-------------------------------
-- 4. Adjust application_assessment
-------------------------------
-- (a) Add new columns.
ALTER TABLE application_assessment
  ADD COLUMN new_course_phase_id uuid,
  ADD COLUMN new_course_participation_id uuid;

-- (b) Populate the new columns.
UPDATE application_assessment a
SET new_course_phase_id = cp.course_phase_id,
    new_course_participation_id = cp.course_participation_id
FROM course_phase_participation cp
WHERE a.course_phase_participation_id = cp.old_id;

ALTER TABLE application_assessment
  ALTER COLUMN new_course_phase_id SET NOT NULL,
  ALTER COLUMN new_course_participation_id SET NOT NULL;

-- (c) Drop the old foreign key constraint.
ALTER TABLE application_assessment
  DROP CONSTRAINT fk_course_phase_participation;

-- (d) Drop the old surrogate column.
ALTER TABLE application_assessment
  DROP COLUMN course_phase_participation_id;

-- (e) Rename the new columns.
ALTER TABLE application_assessment
  RENAME COLUMN new_course_phase_id TO course_phase_id;

ALTER TABLE application_assessment
  RENAME COLUMN new_course_participation_id TO course_participation_id;

-- (f) Add the new foreign key constraint.
ALTER TABLE application_assessment
  ADD CONSTRAINT fk_course_phase_participation
    FOREIGN KEY (course_participation_id, course_phase_id)
    REFERENCES course_phase_participation (course_participation_id, course_phase_id)
    ON DELETE CASCADE;

-------------------------------
-- 5. Final Cleanup
-------------------------------
-- If you no longer need the old surrogate mapping in course_phase_participation,
-- you can drop the old_id column. (Make sure all referencing tables have been updated.)

-- Drop the old primary key constraint (assumed name).
ALTER TABLE course_phase_participation
  DROP CONSTRAINT course_phase_participation_pkey;

-- Add the new composite primary key.
ALTER TABLE course_phase_participation
  ADD PRIMARY KEY (course_participation_id, course_phase_id);


ALTER TABLE course_phase_participation
  DROP COLUMN old_id;

COMMIT;
