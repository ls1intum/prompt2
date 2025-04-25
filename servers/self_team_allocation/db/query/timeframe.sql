-- Returns the start and end time for a given course phase.
-- name: GetTimeframe :one
SELECT starttime, endtime
FROM timeframe
WHERE course_phase_id = $1;

-- Upsert the start and end time for a given course phase.
-- name: SetTimeframe :exec
INSERT INTO timeframe (course_phase_id, starttime, endtime)
VALUES ($1, $2, $3)
ON CONFLICT (course_phase_id)
DO UPDATE SET starttime = EXCLUDED.starttime,
               endtime = EXCLUDED.endtime;