BEGIN;

CREATE VIEW
    weighted_participant_scores AS
WITH
    score_values AS (
        SELECT
            a.course_phase_id,
            a.course_participation_id,
            CASE a.score
                WHEN 'novice' THEN 1
                WHEN 'intermediate' THEN 2
                WHEN 'advanced' THEN 3
                WHEN 'expert' THEN 4
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
            ) AS weighted_score_sum,
            SUM(competency_weight * category_weight) AS total_weight
        FROM
            score_values
        GROUP BY
            course_phase_id,
            course_participation_id
    )
SELECT
    course_phase_id,
    course_participation_id,
    ROUND((weighted_score_sum / total_weight), 2) AS score_numeric
FROM
    weighted_scores;

COMMIT;