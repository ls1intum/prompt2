-- Add short course description column
BEGIN;

ALTER TABLE course
    ADD COLUMN short_description VARCHAR(255);

-- Add long course description column
ALTER TABLE course
    ADD COLUMN long_description TEXT;

COMMIT;