-- name: GetCertificateMetadata :one
SELECT *
FROM certificate_metadata
WHERE
    student_id = $1
    AND course_id = $2
LIMIT 1;

-- name: GetCertificateMetadataByStudentID :one
SELECT * FROM certificate_metadata WHERE student_id = $1 LIMIT 1;

-- name: ListCertificateMetadataByCourse :many
SELECT *
FROM certificate_metadata
WHERE
    course_id = $1
ORDER BY generated_at DESC;

-- name: CreateCertificateMetadata :one
INSERT INTO
    certificate_metadata (
        student_id,
        course_id,
        certificate_url
    )
VALUES ($1, $2, $3) RETURNING *;

-- name: UpdateCertificateMetadata :one
UPDATE certificate_metadata
SET
    generated_at = $3,
    certificate_url = $4
WHERE
    student_id = $1
    AND course_id = $2 RETURNING *;

-- name: UpsertCertificateMetadata :one
INSERT INTO
    certificate_metadata (
        student_id,
        course_id,
        generated_at,
        certificate_url
    )
VALUES ($1, $2, $3, $4) ON CONFLICT (student_id, course_id) DO
UPDATE
SET
    generated_at = EXCLUDED.generated_at,
    certificate_url = EXCLUDED.certificate_url RETURNING *;

-- name: UpdateDownloadInfo :one
UPDATE certificate_metadata
SET
    last_download = $3,
    download_count = download_count + 1
WHERE
    student_id = $1
    AND course_id = $2 RETURNING *;

-- name: DeleteCertificateMetadata :exec
DELETE FROM certificate_metadata
WHERE
    student_id = $1
    AND course_id = $2;