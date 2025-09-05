-- Drop the existing constraint if it exists
ALTER TABLE course
    DROP CONSTRAINT IF EXISTS check_end_date_after_start_date;

-- Add a new check constraint that allows end_date to be null for templates
-- or ensures that end_date is after start_date for non-template courses
ALTER TABLE course
    ADD CONSTRAINT check_end_date_after_start_date CHECK (
        template = true
            OR end_date > start_date
        );
