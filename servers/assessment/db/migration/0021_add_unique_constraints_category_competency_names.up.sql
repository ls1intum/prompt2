-- Add unique constraints to ensure category names are unique within a schema
-- and competency names are unique within a category
-- This prevents the name-based mapping logic from returning arbitrary matches

BEGIN;

-- First, check for and report any existing duplicates (will fail if duplicates exist)
-- This ensures data integrity before adding the constraint

-- Check for duplicate category names within schemas
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT assessment_schema_id, name, COUNT(*) as cnt
        FROM category
        GROUP BY assessment_schema_id, name
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Found % duplicate category name(s) within schema(s). Please ensure category names are unique within each assessment schema before applying this migration.', duplicate_count;
    END IF;
END $$;

-- Check for duplicate competency names within categories
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT category_id, name, COUNT(*) as cnt
        FROM competency
        GROUP BY category_id, name
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Found % duplicate competency name(s) within categor(ies). Please ensure competency names are unique within each category before applying this migration.', duplicate_count;
    END IF;
END $$;

-- Add unique constraint to category table
-- This ensures category names are unique within each assessment schema
ALTER TABLE category
    ADD CONSTRAINT category_assessment_schema_id_name_unique 
    UNIQUE (assessment_schema_id, name);

-- Add unique constraint to competency table
-- This ensures competency names are unique within each category
ALTER TABLE competency
    ADD CONSTRAINT competency_category_id_name_unique 
    UNIQUE (category_id, name);

COMMIT;
