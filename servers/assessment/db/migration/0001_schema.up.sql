BEGIN;

CREATE TABLE
    competency (
        id uuid NOT NULL PRIMARY KEY,
        super_competency_id uuid,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        FOREIGN KEY (super_competency_id) REFERENCES competency (id) ON DELETE CASCADE
    );

-- save scoring guidance (text for each level - novice to expert)
CREATE TABLE
    rubric (
        id uuid NOT NULL PRIMARY KEY,
        competency_id uuid NOT NULL,
        level SMALLINT NOT NULL CHECK (
            level >= 1
            AND level <= 4
        ),
        description TEXT NOT NULL,
        FOREIGN KEY (competency_id) REFERENCES competency (id) ON DELETE CASCADE
    );

CREATE TABLE
    assessment (
        id uuid NOT NULL PRIMARY KEY,
        assessor_id uuid NOT NULL,
        assessee_id uuid NOT NULL,
        competency_id uuid NOT NULL,
        score SMALLINT NOT NULL CHECK (
            score >= 1
            AND score <= 4
        ),
        comment TEXT,
        assessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (assessor_id, assessee_id, competency_id),
        FOREIGN KEY (competency_id) REFERENCES competency (id) ON DELETE CASCADE
    );

COMMIT;