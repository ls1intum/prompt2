BEGIN;

-- Certificate metadata table to track generated certificates
CREATE TABLE certificate_metadata (
    id                  SERIAL PRIMARY KEY,
    student_id          uuid NOT NULL,
    course_id           uuid NOT NULL,
    generated_at        timestamp with time zone NOT NULL DEFAULT NOW(),
    last_download       timestamp with time zone,
    download_count      integer NOT NULL DEFAULT 0,
    certificate_url     text NOT NULL,

-- Add indexes for performance
CONSTRAINT idx_certificate_metadata_student_course UNIQUE (student_id, course_id)
);

-- Indexes
CREATE INDEX idx_certificate_metadata_student_id ON certificate_metadata (student_id);

CREATE INDEX idx_certificate_metadata_course_id ON certificate_metadata (course_id);

COMMIT;