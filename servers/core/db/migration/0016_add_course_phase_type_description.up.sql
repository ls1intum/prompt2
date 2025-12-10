-- SCHEMA CHANGES:
-- Add Description column to course phase type
ALTER TABLE course_phase_type
ADD COLUMN IF NOT EXISTS description text;


-- UPDATE EXISTING RECORDS:
-- update existing course_phase_type names to the correct names (changed in the same commit)
UPDATE course_phase_type
SET name = 'DevOps Challenge'
WHERE name = 'DevOpsChallenge';

UPDATE course_phase_type
SET name = 'Intro Course Developer'
WHERE name = 'IntroCourseDeveloper';

-- set the description for all existing course_phase_type records
UPDATE course_phase_type
SET description = 'A A placeholder description for this course phase type. Detailed description will follow.placeholder description for this course phase type. Detailed description will follow.'
WHERE name = 'Intro Course Developer';

UPDATE course_phase_type
SET description = 'A placeholder description for this course phase type. Detailed description will follow.'
WHERE name = 'Self Team Allocation';

UPDATE course_phase_type
SET description = 'A placeholder description for this course phase type. Detailed description will follow.'
WHERE name = 'DevOps Challenge';

UPDATE course_phase_type
SET description = 'A placeholder description for this course phase type. Detailed description will follow.'
WHERE name = 'Team Allocation';

UPDATE course_phase_type
SET description = 'A placeholder description for this course phase type. Detailed description will follow.'
WHERE name = 'Application';

UPDATE course_phase_type
SET description = 'A placeholder description for this course phase type. Detailed description will follow.'
WHERE name = 'Matching';

UPDATE course_phase_type
SET description = 'A placeholder description for this course phase type. Detailed description will follow.'
WHERE name = 'Assessment';

UPDATE course_phase_type
SET description = 'A placeholder description for this course phase type. Detailed description will follow.'
WHERE name = 'Interview';
