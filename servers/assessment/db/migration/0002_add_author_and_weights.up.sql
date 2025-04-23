BEGIN;

-- Add 'weight' to category
ALTER TABLE category
ADD COLUMN weight INTEGER NOT NULL DEFAULT 1;

-- Add 'weight' to competency
ALTER TABLE competency
ADD COLUMN weight INTEGER NOT NULL DEFAULT 1;

-- Add 'author' to assessment
ALTER TABLE assessment
ADD COLUMN author TEXT NOT NULL DEFAULT '';

COMMIT;