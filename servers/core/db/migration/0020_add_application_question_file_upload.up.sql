CREATE TABLE IF NOT EXISTS application_question_file_upload (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_phase_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT false,
    allowed_file_types TEXT,
    max_file_size_mb INTEGER,
    order_num INTEGER NOT NULL,
    accessible_for_other_phases BOOLEAN NOT NULL DEFAULT false,
    access_key TEXT,
    CONSTRAINT fk_application_question_file_upload_course_phase FOREIGN KEY (course_phase_id) REFERENCES course_phase(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_application_question_file_upload_course_phase_id ON application_question_file_upload(course_phase_id);
CREATE INDEX IF NOT EXISTS idx_application_question_file_upload_order_num ON application_question_file_upload(course_phase_id, order_num);
