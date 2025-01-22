-- name: GetCourse :one
SELECT * FROM course
WHERE id = $1 LIMIT 1;

-- name: GetAllActiveCourses :many
SELECT * FROM course
WHERE end_date >= NOW() - INTERVAL '1 month';;

-- name: CreateCourse :one
INSERT INTO course (id, name, start_date, end_date, semester_tag, course_type, ects, meta_data)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
RETURNING *;

-- name: CheckCoursePhasesBelongToCourse :one
WITH matched_phases AS (
  SELECT id
  FROM course_phase
  WHERE id = ANY($1::uuid[])
    AND course_id = $2
)
SELECT CASE 
         WHEN COUNT(*) = cardinality($1::uuid[]) THEN true 
         ELSE false 
       END AS all_exist_and_match_course
FROM matched_phases;

-- name: UpdateCourse :exec
UPDATE course
SET 
  meta_data = meta_data || $2
WHERE id = $1;
