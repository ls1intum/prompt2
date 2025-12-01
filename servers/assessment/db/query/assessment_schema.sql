-- name: CreateAssessmentSchema :exec
INSERT INTO assessment_schema (id, name, description, created_at, updated_at, source_phase_id)
VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $4);

-- name: GetAssessmentSchema :one
SELECT *
FROM assessment_schema
WHERE id = $1;

-- name: ListAssessmentSchemas :many
SELECT *
FROM assessment_schema
ORDER BY name ASC;

-- name: UpdateAssessmentSchema :exec
UPDATE assessment_schema
SET name        = $2,
    description = $3,
    updated_at  = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: DeleteAssessmentSchema :exec
DELETE
FROM assessment_schema
WHERE id = $1;

-- name: GetAssessmentSchemaByName :one
SELECT *
FROM assessment_schema
WHERE name = $1;

-- name: CopyAssessmentSchema :one
WITH cfg AS (SELECT assessment_schema_id
             FROM course_phase_config
             WHERE course_phase_id = sqlc.arg(course_phase_id)),
     src_schema AS (SELECT s.*
                    FROM assessment_schema s
                             JOIN cfg ON s.id = cfg.assessment_schema_id),
     new_schema AS (
         INSERT INTO assessment_schema (id, name, description, created_at, updated_at, source_phase_id)
             SELECT gen_random_uuid()    AS id,
                    sqlc.arg(course_identifier_prefix) || ' ' || s.name  AS name,
                    s.description        AS description,
                    CURRENT_TIMESTAMP    AS created_at,
                    CURRENT_TIMESTAMP    AS updated_at,
                    sqlc.arg(course_phase_id) AS source_phase_id
             FROM src_schema s
             RETURNING id, name, description, created_at, updated_at, source_phase_id),
     cat_map AS (SELECT c.id              AS old_id,
                        gen_random_uuid() AS new_id,
                        c.name,
                        c.description,
                        c.weight,
                        c.short_name
                 FROM category c
                          JOIN cfg ON c.assessment_schema_id = cfg.assessment_schema_id),
     inserted_categories AS (
         INSERT INTO category (id, name, description, weight, short_name, assessment_schema_id)
             SELECT cm.new_id,
                    cm.name,
                    cm.description,
                    cm.weight,
                    cm.short_name,
                    ns.id
             FROM cat_map cm
                      CROSS JOIN new_schema ns
             RETURNING id),
     inserted_competencies AS (
         INSERT INTO competency (
                                 id,
                                 category_id,
                                 name,
                                 description,
                                 weight,
                                 short_name,
                                 description_very_bad,
                                 description_bad,
                                 description_ok,
                                 description_good,
                                 description_very_good
             )
             SELECT gen_random_uuid(),
                    cm.new_id,
                    co.name,
                    co.description,
                    co.weight,
                    co.short_name,
                    co.description_very_bad,
                    co.description_bad,
                    co.description_ok,
                    co.description_good,
                    co.description_very_good
             FROM competency co
                      JOIN cat_map cm ON co.category_id = cm.old_id
             RETURNING id)
SELECT *
FROM new_schema;

-- name: GetCorrespondingCompetencyInNewSchema :one
WITH old_comp AS (
    SELECT comp.id, comp.name AS comp_name, comp.category_id,
           cat.name AS cat_name, cat.assessment_schema_id AS old_schema_id
    FROM competency comp
    INNER JOIN category cat ON comp.category_id = cat.id
    WHERE comp.id = sqlc.arg(old_competency_id)
),
new_comp AS (
    SELECT comp.id, comp.name AS comp_name, comp.category_id,
           cat.name AS cat_name, cat.id AS new_cat_id
    FROM competency comp
    INNER JOIN category cat ON comp.category_id = cat.id
    WHERE cat.assessment_schema_id = sqlc.arg(new_schema_id)
)
SELECT nc.id AS competency_id, nc.new_cat_id AS category_id
FROM old_comp oc
INNER JOIN new_comp nc ON oc.cat_name = nc.cat_name AND oc.comp_name = nc.comp_name
LIMIT 1;

-- name: GetCorrespondingCategoryInNewSchema :one
SELECT cat.id
FROM category cat
WHERE cat.assessment_schema_id = sqlc.arg(new_schema_id)
  AND cat.name = (
    SELECT old_cat.name FROM category old_cat WHERE old_cat.id = sqlc.arg(old_category_id)
)
LIMIT 1;

-- name: CheckSchemaOwnership :one
SELECT EXISTS(
    SELECT 1 
    FROM assessment_schema 
    WHERE id = $1 
    AND (source_phase_id = $2 OR source_phase_id IS NULL)
);

-- name: GetConsumerPhases :many
SELECT DISTINCT cpc.course_phase_id
FROM course_phase_config cpc
WHERE (
    cpc.assessment_schema_id = $1
    OR cpc.self_evaluation_schema = $1
    OR cpc.peer_evaluation_schema = $1
    OR cpc.tutor_evaluation_schema = $1
)
AND cpc.course_phase_id != $2;

-- name: CheckPhaseHasAssessmentData :one
SELECT EXISTS(
    SELECT 1 FROM assessment a
    WHERE a.course_phase_id = $1
    AND a.competency_id IN (
        SELECT co.id FROM competency co
        JOIN category cat ON co.category_id = cat.id
        WHERE cat.assessment_schema_id = $2
    )
) OR EXISTS(
    SELECT 1 FROM evaluation e
    WHERE e.course_phase_id = $1
    AND e.competency_id IN (
        SELECT co.id FROM competency co
        JOIN category cat ON co.category_id = cat.id
        WHERE cat.assessment_schema_id = $2
    )
);

-- name: UpdateAssessmentCompetencies :exec
UPDATE assessment
SET competency_id = $3
WHERE course_phase_id = $1
AND competency_id = $2;

-- name: UpdateEvaluationCompetencies :exec
UPDATE evaluation
SET competency_id = $3
WHERE course_phase_id = $1
AND competency_id = $2;