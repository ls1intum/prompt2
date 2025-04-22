CREATE VIEW
    completed_score_levels AS
SELECT
    slc.course_phase_id,
    slc.course_participation_id,
    slc.score_level
FROM
    score_level_categories slc
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