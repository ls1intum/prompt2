BEGIN;

----------------------------------------------------------------------------
-- 1. Create New DTO Tables
----------------------------------------------------------------------------

-- 1.1 Provided Output DTO table
CREATE TABLE course_phase_type_provided_output_dto (
    id                      uuid        PRIMARY KEY, 
    course_phase_type_id    uuid        NOT NULL,
    dto_name                 text        NOT NULL,
    version_number          integer     NOT NULL,
    endpoint_path            text        NOT NULL,
    specification           jsonb       NOT NULL,
    CONSTRAINT fk_course_phase_type_provided
      FOREIGN KEY (course_phase_type_id)
      REFERENCES course_phase_type(id)
      ON DELETE CASCADE
);

-- 1.2 Required Input DTO table
CREATE TABLE course_phase_type_required_input_dto (
    id                      uuid PRIMARY KEY,
    course_phase_type_id    uuid NOT NULL,
    dto_name                 text NOT NULL,
    specification           jsonb NOT NULL,
    CONSTRAINT fk_course_phase_type_required
      FOREIGN KEY (course_phase_type_id)
      REFERENCES course_phase_type(id)
      ON DELETE CASCADE
);

----------------------------------------------------------------------------
-- 2. Alter meta_data_dependency_graph Table to Add DTO Constraints
----------------------------------------------------------------------------
-- We drop the old table
DROP TABLE meta_data_dependency_graph;
CREATE TABLE meta_data_dependency_graph (
  from_course_phase_id                   uuid NOT NULL,
  to_course_phase_id                     uuid NOT NULL,
  from_course_phase_DTO_id        uuid NOT NULL,
  to_course_phase_DTO_id          uuid NOT NULL,
  PRIMARY KEY (to_course_phase_id, to_course_phase_DTO_id), -- indirect unique constraint
  CONSTRAINT fk_from_phase
    FOREIGN KEY (from_course_phase_id) REFERENCES course_phase(id) ON DELETE CASCADE,
  CONSTRAINT fk_to_phase
    FOREIGN KEY (to_course_phase_id) REFERENCES course_phase(id) ON DELETE CASCADE,
  CONSTRAINT fk_from_dto
    FOREIGN KEY (from_course_phase_DTO_id)
    REFERENCES course_phase_type_provided_output_dto(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_to_dto
    FOREIGN KEY (to_course_phase_DTO_id)
    REFERENCES course_phase_type_required_input_dto(id)
    ON DELETE CASCADE
);

----------------------------------------------------------------------------
-- 3. Alter course_phase_type Table
----------------------------------------------------------------------------
-- 3.1 Add new column "base_url"
ALTER TABLE course_phase_type
  ADD COLUMN base_url text NOT NULL DEFAULT 'core',
  DROP COLUMN required_input_meta_data,
  DROP COLUMN provided_output_meta_data;

----------------------------------------------------------------------------
-- 4. Migrate Legacy Metadata into the New DTO Tables
----------------------------------------------------------------------------


-- 4.1 For the "Application" phase type.
--     Look up the phase by name, update its URL to 'core', and insert two provided output DTOs.
DO $$
DECLARE
  phase_id uuid;
BEGIN
  SELECT id INTO phase_id FROM course_phase_type WHERE name = 'Application';
  IF phase_id IS NOT NULL THEN
    -- Set the URL to 'core'
    UPDATE course_phase_type
      SET base_url = 'core'
      WHERE id = phase_id;
      
    -- Insert Provided Output DTO "Score" (a minimal object schema)
    INSERT INTO course_phase_type_provided_output_dto (id, course_phase_type_id, dto_name, version_number, endpoint_path, specification)
    VALUES (
      gen_random_uuid(),
      phase_id,
      'score',      -- TODO: rename 'applicationScore' to 'score' in code
      1,
      'core',
      '{"type": "integer"}'::jsonb
    );
    
    -- Insert Provided Output DTO "Application" using an inline JSON Schema.
    -- This schema is defined in the style of the others:
    -- It is an array whose items can be either a TextAnswer or a MultiSelectAnswer.
    INSERT INTO course_phase_type_provided_output_dto (id, course_phase_type_id, dto_name, version_number, endpoint_path, specification)
    VALUES (
      gen_random_uuid(),
      phase_id,
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

    INSERT INTO course_phase_type_provided_output_dto (id, course_phase_type_id, dto_name, version_number, endpoint_path, specification)
    VALUES (
      gen_random_uuid(),
      phase_id,
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
  END IF;
END$$;

-- 4.2 For the "Matching" phase type.
--     Migrate legacy required_input_meta_data (an array) into required_input_dto rows.
DO $$
DECLARE
  phase_id uuid;
BEGIN
  SELECT id INTO phase_id
  FROM course_phase_type
  WHERE name = 'Matching';
  
  IF phase_id IS NOT NULL THEN 
    UPDATE course_phase_type
      SET base_url = 'core'
      WHERE id = phase_id;

    INSERT INTO course_phase_type_required_input_dto (id, course_phase_type_id, dto_name, specification)
    VALUES (
      gen_random_uuid(),
      phase_id,
      'score',
      '{"type": "integer"}'::jsonb
    );
  END IF;
END$$;

-- 4.3 For the "Interview" phase type.
--     Migrate both legacy required_input_meta_data and provided_output_meta_data.
DO $$
DECLARE
  phase_id uuid;
BEGIN
  SELECT id INTO phase_id
  FROM course_phase_type
  WHERE name = 'Interview';
  
  IF phase_id IS NOT NULL THEN 
    UPDATE course_phase_type
      SET base_url = 'core'
      WHERE id = phase_id;

    INSERT INTO course_phase_type_provided_output_dto (id, course_phase_type_id, dto_name, version_number, endpoint_path, specification)
    VALUES (
      gen_random_uuid(),
      phase_id,
      'score',
      1,
      'core',
      '{"type": "integer"}'::jsonb
    );

    INSERT INTO course_phase_type_required_input_dto (id, course_phase_type_id, dto_name, specification)
    VALUES (
      gen_random_uuid(),
      phase_id,
      'score',
      '{"type": "integer"}'::jsonb
    );

    INSERT INTO course_phase_type_required_input_dto (id, course_phase_type_id, dto_name, specification)
    VALUES (
       gen_random_uuid(),
       phase_id,
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
  END IF;
END$$;

-- Interview now works on score instead of interviewScore

UPDATE course_phase_participation
SET restricted_data = 
    (restricted_data - 'interviewScore') ||
    jsonb_build_object('score', restricted_data->'interviewScore')
WHERE restricted_data ? 'interviewScore';


COMMIT;