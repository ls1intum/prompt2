BEGIN;

CREATE TABLE
    category (
        id uuid NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT
    );

CREATE TABLE
    competency (
        id uuid NOT NULL PRIMARY KEY,
        category_id uuid NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        novice TEXT NOT NULL,
        intermediate TEXT NOT NULL,
        advanced TEXT NOT NULL,
        expert TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
    );

CREATE TYPE score_level AS ENUM ('novice', 'intermediate', 'advanced', 'expert');

CREATE TABLE
    assessment (
        id uuid NOT NULL PRIMARY KEY,
        course_participation_id uuid NOT NULL,
        course_phase_id uuid NOT NULL,
        competency_id uuid NOT NULL,
        score score_level NOT NULL,
        comment TEXT,
        assessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (
            course_participation_id,
            course_phase_id,
            competency_id
        ),
        FOREIGN KEY (competency_id) REFERENCES competency (id) ON DELETE CASCADE
    );

COMMIT;