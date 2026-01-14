-- Migration: Create Instructor Notes

CREATE TABLE note (
  id             uuid PRIMARY KEY,
  for_student    uuid NOT NULL REFERENCES student(id),
  author         uuid NOT NULL,
  date_created   date NOT NULL,
  date_deleted   date,
  deleted_by     uuid
);

CREATE TABLE note_version (
  id             uuid PRIMARY KEY,
  content        text NOT NULL,
  date_created   date NOT NULL,
  version_number int NOT NULL,
  for_note       uuid NOT NULL REFERENCES note(id)
);

CREATE TABLE note_tag (
  id   uuid PRIMARY KEY,
  name text NOT NULL UNIQUE
);

CREATE TABLE note_tag_relation (
  note_id uuid NOT NULL REFERENCES note(id) ON DELETE CASCADE,
  tag_id  uuid NOT NULL REFERENCES note_tag(id) ON DELETE CASCADE
);

CREATE INDEX idx_note_tag_tag_id ON note_tag_relation(tag_id);
CREATE INDEX idx_note_tag_note_id ON note_tag_relation(note_id);

-- view: reusable CTE

CREATE VIEW note_with_versions AS
SELECT
  n.id,
  n.author,
  n.for_student,
  n.date_created,
  n.date_deleted,
  n.deleted_by,
  jsonb_agg(
    jsonb_build_object(
      'id', nv.id,
      'content', nv.content,
      'date_created', nv.date_created,
      'version_number', nv.version_number
    )
    ORDER BY nv.version_number
  ) AS versions
FROM note n
JOIN note_version nv ON nv.for_note = n.id
GROUP BY n.id;
