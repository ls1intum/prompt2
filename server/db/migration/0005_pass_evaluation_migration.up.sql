BEGIN;

-- Step 1: Create the new ENUM type
CREATE TYPE pass_status AS ENUM ('passed', 'failed', 'not_assessed');

-- Step 2: Add a new column with the ENUM type
ALTER TABLE course_phase_participation
ADD COLUMN pass_status pass_status DEFAULT 'not_assessed';

-- Step 3: Migrate data from the old `passed` column to the new column
UPDATE course_phase_participation
SET pass_status = CASE
    WHEN passed = true THEN 'passed'
    WHEN passed = false THEN 'failed'
    ELSE 'not_assessed'
END;

-- Step 4: Drop the old `passed` column
ALTER TABLE course_phase_participation
DROP COLUMN passed;


COMMIT;
