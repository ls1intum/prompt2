BEGIN;
DROP VIEW IF EXISTS completed_score_levels;
DROP VIEW IF EXISTS weighted_participant_scores;

CREATE VIEW weighted_participant_scores AS
WITH numeric_scores AS (SELECT a.course_phase_id,
                               a.course_participation_id,
                               comp.id     AS competency_id,
                               cat.id      AS category_id,
                               CASE a.score_level
                                   WHEN 'very_bad' THEN 5
                                   WHEN 'bad' THEN 4
                                   WHEN 'ok' THEN 3
                                   WHEN 'good' THEN 2
                                   WHEN 'very_good' THEN 1
                                   END     AS score_numeric,
                               comp.weight AS competency_weight,
                               cat.weight  AS category_weight
                        FROM assessment a
                                 JOIN competency comp
                                      ON a.competency_id = comp.id
                                 JOIN category cat
                                      ON comp.category_id = cat.id),
     cat_weights AS (SELECT ns.course_phase_id,
                            ns.course_participation_id,
                            ns.category_id,
                            SUM(ns.competency_weight)::NUMERIC AS total_comp_weight,
                            MAX(ns.category_weight)::NUMERIC   AS category_weight
                     FROM numeric_scores ns
                     GROUP BY ns.course_phase_id,
                              ns.course_participation_id,
                              ns.category_id),
     competency_agg AS (SELECT course_phase_id,
                               course_participation_id,
                               category_id,
                               competency_id,
                               SUM(score_numeric * competency_weight)::NUMERIC AS comp_score_sum
                        FROM numeric_scores
                        GROUP BY course_phase_id,
                                 course_participation_id,
                                 category_id,
                                 competency_id),
     category_agg AS (SELECT ca.course_phase_id,
                             ca.course_participation_id,
                             ca.category_id,
                             SUM(
                                     ca.comp_score_sum
                                         / NULLIF(cw.total_comp_weight, 0)
                             )::NUMERIC AS category_score,
                             cw.category_weight
                      FROM competency_agg ca
                               JOIN cat_weights cw
                                    ON ca.category_id = cw.category_id
                                        AND ca.course_phase_id = cw.course_phase_id
                                        AND ca.course_participation_id = cw.course_participation_id
                      GROUP BY ca.course_phase_id,
                               ca.course_participation_id,
                               ca.category_id,
                               cw.category_weight),
     final_scores AS (SELECT course_phase_id,
                             course_participation_id,
                             SUM(category_score * category_weight)::NUMERIC AS weighted_category_sum,
                             SUM(category_weight)::NUMERIC                  AS total_category_weight
                      FROM category_agg
                      GROUP BY course_phase_id,
                               course_participation_id),
     base_scores AS (SELECT course_phase_id,
                            course_participation_id,
                            ROUND(
                                    (weighted_category_sum
                                        / NULLIF(total_category_weight, 0))::NUMERIC,
                                    2
                            ) AS score_numeric
                     FROM final_scores)

SELECT course_phase_id,
       course_participation_id,
       score_numeric,
       CASE
           WHEN score_numeric <= 1.5 THEN 'very_good'
           WHEN score_numeric <= 2.5 THEN 'good'
           WHEN score_numeric <= 3.5 THEN 'ok'
           WHEN score_numeric <= 4.5 THEN 'bad'
           ELSE 'very_bad'
           END AS score_level
FROM base_scores;

CREATE VIEW completed_score_levels AS
SELECT slc.course_phase_id,
       slc.course_participation_id,
       slc.score_level
FROM weighted_participant_scores slc
WHERE EXISTS (SELECT 1
              FROM assessment_completion ac
              WHERE ac.course_participation_id = slc.course_participation_id
                AND ac.course_phase_id = slc.course_phase_id);

COMMIT;
