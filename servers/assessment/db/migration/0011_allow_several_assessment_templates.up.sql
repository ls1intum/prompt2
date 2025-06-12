BEGIN;

CREATE table assessment_template
(
    id          uuid PRIMARY KEY,
    name        TEXT      NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assessment_template_course_phase
(
    assessment_template_id uuid             NOT NULL,
    course_phase_id        uuid PRIMARY KEY NOT NULL,
    FOREIGN KEY (assessment_template_id) references assessment_template (id) ON DELETE CASCADE
);

INSERT INTO assessment_template (id, name, description)
VALUES (gen_random_uuid(), 'Intro Course Assessment Template',
        'This is the default assessment template.');

ALTER TABLE category
    ADD COLUMN assessment_template_id uuid;

UPDATE category
SET assessment_template_id = (SELECT id FROM assessment_template WHERE name = 'Intro Course Assessment Template')
WHERE assessment_template_id IS NULL;

ALTER TABLE category
    ALTER COLUMN assessment_template_id SET NOT NULL;

ALTER TABLE category
    ADD FOREIGN KEY (assessment_template_id) REFERENCES assessment_template (id) ON DELETE CASCADE;

CREATE VIEW category_course_phase AS
SELECT c.id AS category_id,
       atcp.course_phase_id
FROM category c
         INNER JOIN assessment_template_course_phase atcp
                    ON c.assessment_template_id = atcp.assessment_template_id;

INSERT INTO assessment_template_course_phase (assessment_template_id, course_phase_id)
SELECT att.id, a.course_phase_id
FROM assessment a
         CROSS JOIN assessment_template att
WHERE att.name = 'Intro Course Assessment Template'
  AND NOT EXISTS (SELECT 1
                  FROM assessment_template_course_phase atcp
                  WHERE atcp.assessment_template_id = att.id
                    AND atcp.course_phase_id = a.course_phase_id)
GROUP BY att.id, a.course_phase_id;

COMMIT;