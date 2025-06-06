BEGIN;

-- 1. Create new enum type with updated values
CREATE TYPE score_level_new AS ENUM ('very_bad', 'bad', 'ok', 'good', 'very_good');

-- 2. Drop dependent views first before modifying the assessment table
DROP VIEW IF EXISTS completed_score_levels;

DROP VIEW IF EXISTS weighted_participant_scores;

-- 3. Add temporary column with new enum type
ALTER TABLE assessment
ADD COLUMN score_new score_level_new;

-- 4. Migrate existing data from old enum to new enum
UPDATE assessment
SET score_new = CASE
        score
        WHEN 'novice' THEN 'bad'::score_level_new
        WHEN 'intermediate' THEN 'ok'::score_level_new
        WHEN 'advanced' THEN 'good'::score_level_new
        WHEN 'expert' THEN 'very_good'::score_level_new
    END;

-- 5. Make the new column NOT NULL since all rows should have been updated
ALTER TABLE assessment
ALTER COLUMN score_new
SET NOT NULL;

-- 6. Drop the old column and constraint
ALTER TABLE assessment DROP COLUMN score;

-- 7. Rename the new column to the original name
ALTER TABLE assessment
    RENAME COLUMN score_new TO score_level;

-- 8. Drop the old enum type
DROP TYPE score_level;

-- 9. Rename the new enum type to the original name
ALTER TYPE score_level_new
RENAME TO score_level;

-- 10. Map competency table descriptions to new score levels
-- Add new columns for the new score levels
ALTER TABLE competency
ADD COLUMN description_very_bad TEXT NOT NULL DEFAULT '',
    ADD COLUMN description_bad TEXT NOT NULL DEFAULT '',
    ADD COLUMN description_ok TEXT NOT NULL DEFAULT '',
    ADD COLUMN description_good TEXT NOT NULL DEFAULT '',
    ADD COLUMN description_very_good TEXT NOT NULL DEFAULT '';

-- Map existing descriptions to new score levels
UPDATE competency
SET description_bad = novice,
    description_ok = intermediate,
    description_good = advanced,
    description_very_good = expert;

-- Drop the old columns after mapping
ALTER TABLE competency DROP COLUMN novice,
    DROP COLUMN intermediate,
    DROP COLUMN advanced,
    DROP COLUMN expert;

-- 11. Recreate views with updated score level values
-- Update weighted_participant_scores view to use new enum values
CREATE OR REPLACE VIEW weighted_participant_scores AS WITH score_values AS (
        SELECT a.course_phase_id,
            a.course_participation_id,
            CASE
                a.score_level
                WHEN 'very_bad' THEN 5
                WHEN 'bad' THEN 4
                WHEN 'ok' THEN 3
                WHEN 'good' THEN 2
                WHEN 'very_good' THEN 1
            END AS score_numeric,
            comp.weight AS competency_weight,
            cat.weight AS category_weight
        FROM assessment a
            JOIN competency comp ON a.competency_id = comp.id
            JOIN category cat ON comp.category_id = cat.id
    ),
    weighted_scores AS (
        SELECT course_phase_id,
            course_participation_id,
            SUM(
                score_numeric * competency_weight * category_weight
            )::NUMERIC AS weighted_score_sum,
            SUM(competency_weight * category_weight)::NUMERIC AS total_weight
        FROM score_values
        GROUP BY course_phase_id,
            course_participation_id
    )
SELECT course_phase_id,
    course_participation_id,
    ROUND(
        (weighted_score_sum / NULLIF(total_weight, 0))::numeric,
        2
    ) AS score_numeric,
    CASE
        WHEN ROUND(
            (weighted_score_sum / NULLIF(total_weight, 0))::numeric,
            2
        ) < 1.25 THEN 'very_good'
        WHEN ROUND(
            (weighted_score_sum / NULLIF(total_weight, 0))::numeric,
            2
        ) < 1.75 THEN 'good'
        WHEN ROUND(
            (weighted_score_sum / NULLIF(total_weight, 0))::numeric,
            2
        ) < 2.5 THEN 'ok'
        WHEN ROUND(
            (weighted_score_sum / NULLIF(total_weight, 0))::numeric,
            2
        ) < 3.25 THEN 'bad'
        ELSE 'very_bad'
    END AS score_level
FROM weighted_scores;

-- Update completed_score_levels view (no changes needed to structure, just references the updated weighted_participant_scores)
CREATE OR REPLACE VIEW completed_score_levels AS
SELECT slc.course_phase_id,
    slc.course_participation_id,
    slc.score_level
FROM weighted_participant_scores slc
WHERE EXISTS (
        SELECT 1
        FROM assessment_completion ac
        WHERE ac.course_participation_id = slc.course_participation_id
            AND ac.course_phase_id = slc.course_phase_id
    );

COMMIT;