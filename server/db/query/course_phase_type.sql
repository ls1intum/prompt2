-- name: GetAllCoursePhaseTypes :many
SELECT * FROM course_phase_type;

-- name: GetCoursePhaseRequiredInputs :many
SELECT *
FROM course_phase_type_required_input_dto
WHERE course_phase_type_id = $1;

-- name: GetCoursePhaseProvidedOutputs :many
SELECT *
FROM course_phase_type_provided_output_dto
WHERE course_phase_type_id = $1;

-- name: TestApplicationPhaseTypeExists :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_type
    WHERE name = 'Application'
) AS does_exist;

-- name: TestInterviewPhaseTypeExists :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_type
    WHERE name = 'Interview'
) AS does_exist;

-- name: TestMatchingPhaseTypeExists :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_type
    WHERE name = 'Matching'
) AS does_exist;

-- name: CreateCoursePhaseType :exec
INSERT INTO course_phase_type (id, name, initial_phase, base_url)
VALUES ($1, $2, $3, $4);

-- name: CreateCoursePhaseTypeRequiredInput :exec
INSERT INTO course_phase_type_required_input_dto (id, course_phase_type_id, dto_name, specification)
VALUES ($1, $2, $3, $4);

-- name: CreateCoursePhaseTypeProvidedOutput :exec
INSERT INTO course_phase_type_provided_output_dto (id, course_phase_type_id, dto_name, version_number, endpoint_path, specification)
VALUES ($1, $2, $3, $4, $5, $6);

-- name: InsertCourseProvidedApplicationAnswers :exec
INSERT INTO course_phase_type_provided_output_dto (id, course_phase_type_id, dto_name, version_number, endpoint_path, specification)
VALUES (
      gen_random_uuid(),
      $1,
      'applicationAnswers',
      1,
      'core',
      '{
            "type": "array",
            "items": {
                "oneOf": [
                {
                    "type": "object",
                    "properties": {
                    "answer"   : { "type": "string"                    },
                    "key"      : { "type": "string"                    },
                    "order_num": { "type": "integer"                   },
                    "type"     : { "type": "string" , "enum": ["text"] }
                    },
                    "required": ["answer", "key", "order_num", "type"]
                },
                {
                    "type": "object",
                    "properties": {
                    "answer"   : { "type": "array", "items": {"type": "string"} },
                    "key"      : {"type": "string"}                              ,
                    "order_num": {"type": "integer"}                             ,
                    "type"     : { "type": "string", "enum": ["multiselect"] }
                    },
                    "required": ["answer", "key", "order_num", "type"]
                }
                ]
            }
       }'::jsonb
);

-- name: InsertCourseProvidedAdditionalScores :exec
INSERT INTO course_phase_type_provided_output_dto (id, course_phase_type_id, dto_name, version_number, endpoint_path, specification)
VALUES (
      gen_random_uuid(),
      $1,
      'additionalScores',
      1,
      'core',
      '{
            "type": "array",
            "items": {
                "type": "object",
                "properties": { "score": {"type": "number"}, "key": {"type": "string"} },
                "required": ["score", "key"]
            }
        }'::jsonb
);