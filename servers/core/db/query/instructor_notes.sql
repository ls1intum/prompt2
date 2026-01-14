-- name: GetStudentNotesForStudent :many
SELECT * FROM note_with_versions WHERE for_student = $1;

-- name: GetAllStudentNotes :many
SELECT * FROM note_with_versions;

-- name: GetAllStudentNotesGroupByStudent :many
SELECT
  s.id,
  jsonb_agg(
    jsonb_build_object(
      'id', n.id,
      'author', n.author,
      'date_created', n.date_created,
      'date_deleted', n.date_deleted,
      'deleted_by', n.deleted_by,
      'versions', n.versions
    )
  ) AS notes
FROM student s
LEFT JOIN note_with_versions n
  ON n.for_student = s.id
GROUP BY s.id;

-- name: GetLatestNoteVersionForNoteId :one
SELECT nv.version_number
FROM note_version nv
WHERE nv.for_note = $1
ORDER BY nv.version_number DESC
LIMIT(1);


-- name: CreateNoteVersion :one
INSERT INTO note_version ( id, content, date_created, version_number, for_note )
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: CreateNote :one
INSERT INTO note (id, for_student, author, date_created, date_deleted, deleted_by)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;


