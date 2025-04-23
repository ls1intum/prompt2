BEGIN;

ALTER TABLE assessment
ALTER COLUMN assessed_at TYPE timestamptz USING assessed_at AT TIME ZONE 'Europe/Berlin';

ALTER TABLE assessment_completion
ALTER COLUMN completed_at TYPE timestamptz USING completed_at AT TIME ZONE 'Europe/Berlin';

COMMIT;