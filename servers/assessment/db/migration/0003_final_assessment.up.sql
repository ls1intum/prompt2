CREATE TABLE
    assessment_completion (
        course_participation_id UUID NOT NULL,
        course_phase_id UUID NOT NULL,
        completed_at TIMESTAMP NOT NULL,
        author TEXT NOT NULL,
        PRIMARY KEY (course_participation_id, course_phase_id)
    );

COMMIT;