BEGIN;

CREATE
OR REPLACE VIEW weighted_participant_scores AS WITH score_values AS (
    SELECT
        a.course_phase_id,
        a.course_participation_id,
        CASE
            a.score
            WHEN 'novice' THEN 4
            WHEN 'intermediate' THEN 3
            WHEN 'advanced' THEN 2
            WHEN 'expert' THEN 1
        END AS score_numeric,
        comp.weight AS competency_weight,
        cat.weight AS category_weight
    FROM
        assessment a
        JOIN competency comp ON a.competency_id = comp.id
        JOIN category cat ON comp.category_id = cat.id
),
weighted_scores AS (
    SELECT
        course_phase_id,
        course_participation_id,
        SUM(
            score_numeric * competency_weight * category_weight
        ) :: NUMERIC AS weighted_score_sum,
        SUM(competency_weight * category_weight) :: NUMERIC AS total_weight
    FROM
        score_values
    GROUP BY
        course_phase_id,
        course_participation_id
)
SELECT
    course_phase_id,
    course_participation_id,
    ROUND(
        (weighted_score_sum / NULLIF(total_weight, 0)) :: numeric,
        2
    ) AS score_numeric,
    CASE
        WHEN ROUND(
            (weighted_score_sum / NULLIF(total_weight, 0)) :: numeric,
            2
        ) < 1.75 THEN 'expert'
        WHEN ROUND(
            (weighted_score_sum / NULLIF(total_weight, 0)) :: numeric,
            2
        ) < 2.5 THEN 'advanced'
        WHEN ROUND(
            (weighted_score_sum / NULLIF(total_weight, 0)) :: numeric,
            2
        ) < 3.25 THEN 'intermediate'
        ELSE 'novice'
    END AS score_level
FROM
    weighted_scores;

CREATE
OR REPLACE VIEW completed_score_levels AS
SELECT
    slc.course_phase_id,
    slc.course_participation_id,
    slc.score_level
FROM
    weighted_participant_scores slc
WHERE
    EXISTS (
        SELECT
            1
        FROM
            assessment_completion ac
        WHERE
            ac.course_participation_id = slc.course_participation_id
            AND ac.course_phase_id = slc.course_phase_id
    );

DROP VIEW IF EXISTS score_level_categories;

CREATE INDEX IF NOT EXISTS idx_assessment_completion_participation_phase ON assessment_completion (course_participation_id, course_phase_id);

COMMIT;