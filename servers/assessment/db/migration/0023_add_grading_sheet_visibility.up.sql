ALTER TABLE course_phase_config
    ADD COLUMN IF NOT EXISTS grading_sheet_visible BOOLEAN NOT NULL DEFAULT FALSE;
 