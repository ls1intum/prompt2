BEGIN;

CREATE TABLE team (
    id uuid NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course_phase_id uuid NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_phase_team UNIQUE (course_phase_id, team_name)
);

CREATE TABLE student_team_preference_response (
    course_participation_id uuid NOT NULL,
    team_id uuid NOT NULL,
    preference INT NOT NULL,
    PRIMARY KEY (course_participation_id, team_id),
    FOREIGN KEY (team_id) REFERENCES team(id)
);

CREATE TABLE survey_timeframe (
    course_phase_id uuid NOT NULL PRIMARY KEY,
    survey_start TIMESTAMP NOT NULL,
    survey_deadline TIMESTAMP NOT NULL
);

CREATE TABLE skill (
    id uuid NOT NULL PRIMARY KEY,
    course_phase_id uuid NOT NULL,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE student_skill_response (
    course_participation_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    rating INT NOT NULL,
    PRIMARY KEY (course_participation_id, skill_id),
    FOREIGN KEY (skill_id) REFERENCES skill(id)
);

COMMIT;