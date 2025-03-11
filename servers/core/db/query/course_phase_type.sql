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

-- name: TestIntroCourseDeveloperPhaseTypeExists :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_type
    WHERE name = 'IntroCourseDeveloper'
) AS does_exist;


-- name: TestIntroCourseTutorPhaseTypeExists :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_type
    WHERE name = 'IntroCourseTutor'
) AS does_exist;

-- name: TestDevOpsChallengeTypeExists :one
SELECT EXISTS (
    SELECT 1
    FROM course_phase_type
    WHERE name = 'DevOpsChallenge'
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

-- name: CreateInterviewRequiredApplicationAnswers :exec
INSERT INTO course_phase_type_required_input_dto (id, course_phase_type_id, dto_name, specification)
VALUES (
       gen_random_uuid(),
       $1,
       'applicationAnswers',    
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


-- name: InsertProficiencyLevelOutput :exec
INSERT INTO course_phase_type_provided_output_dto (id, course_phase_type_id, dto_name, version_number, endpoint_path, specification)
VALUES (
      gen_random_uuid(),
      $1,
      'proficiency',
      1,
      '/proficiency',
      '{
            "type": "string",
            "enum": ["novice", "intermediate", "advanced", "expert"] 
        }'::jsonb
);


-- name: InsertDeveloperProfileOutput :exec
INSERT INTO course_phase_type_provided_output_dto (id, course_phase_type_id, dto_name, version_number, endpoint_path, specification)
VALUES (
      gen_random_uuid(),
      $1,
      'developerProfile',
      1,
      '/developer-profile',
      '{
            "type": "object",
            "properties": {
                "appleID"           : {"type": "string"},
                "gitLabID"          : {"type": "string"},
                "macBookUUID"       : {"type": "string"},
                "iphoneUUID"        : {"type": "string"},
                "ipadUUID"          : {"type": "string"},
                "appleWatchUUID"    : {"type": "string"}
            },
            "required": ["appleID", "gitLabID"]
        }'::jsonb
);