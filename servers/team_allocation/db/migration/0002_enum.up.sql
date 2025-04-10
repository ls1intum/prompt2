BEGIN;

-- 1. Create new enum type
CREATE TYPE skill_level AS ENUM ('novice', 'intermediate', 'advanced', 'expert');

-- 2. Add a temporary column of the new enum type
ALTER TABLE student_skill_response
    ADD COLUMN skill_level skill_level;

-- 3. Convert/migrate existing numeric ratings to enum values
--    Explicitly cast the text to skill_level
UPDATE student_skill_response
SET skill_level = CASE rating
    WHEN 1 THEN 'novice'::skill_level
    WHEN 2 THEN 'intermediate'::skill_level
    WHEN 3 THEN 'advanced'::skill_level
    WHEN 4 THEN 'expert'::skill_level
    -- Decide what to do for values outside 1-4; for example, default to 'novice'
    ELSE 'novice'::skill_level
END;

-- 4. Drop the old numeric column
ALTER TABLE student_skill_response
    DROP COLUMN rating;

-- 6. Make the newly renamed column NOT NULL (if appropriate for your data)
ALTER TABLE student_skill_response
    ALTER COLUMN skill_level SET NOT NULL;

COMMIT;

