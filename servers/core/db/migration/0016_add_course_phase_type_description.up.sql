-- SCHEMA CHANGES:
-- Add Description column to course phase type
ALTER TABLE course_phase_type
ADD COLUMN IF NOT EXISTS description text;

