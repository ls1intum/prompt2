-- Add source_phase_id to assessment_schema table
ALTER TABLE assessment_schema ADD COLUMN source_phase_id uuid;

-- Set source_phase_id for existing schemas to the first phase that uses them
UPDATE assessment_schema s
SET source_phase_id = (
    SELECT cpc.course_phase_id
    FROM course_phase_config cpc
    WHERE cpc.assessment_schema_id = s.id
    ORDER BY cpc.course_phase_id
    LIMIT 1
)
WHERE source_phase_id IS NULL;
