ALTER TABLE course_phase_config
    ADD COLUMN IF NOT EXISTS evaluation_results_visible BOOLEAN NOT NULL DEFAULT TRUE;