-- add archived and archived_on columns to the course table
ALTER TABLE course
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN archived_on TIMESTAMPTZ;
