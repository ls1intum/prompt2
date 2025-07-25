// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: course_phase_config.sql

package db

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const createDefaultCoursePhaseConfig = `-- name: CreateDefaultCoursePhaseConfig :exec
INSERT INTO course_phase_config (course_phase_id)
VALUES ($1)
`

func (q *Queries) CreateDefaultCoursePhaseConfig(ctx context.Context, coursePhaseID uuid.UUID) error {
	_, err := q.db.Exec(ctx, createDefaultCoursePhaseConfig, coursePhaseID)
	return err
}

const createOrUpdateCoursePhaseConfig = `-- name: CreateOrUpdateCoursePhaseConfig :exec
INSERT INTO course_phase_config (assessment_template_id,
                                 course_phase_id,
                                 start,
                                 deadline,
                                 self_evaluation_enabled,
                                 self_evaluation_template,
                                 self_evaluation_start,
                                 self_evaluation_deadline,
                                 peer_evaluation_enabled,
                                 peer_evaluation_template,
                                 peer_evaluation_start,
                                 peer_evaluation_deadline)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
ON CONFLICT (course_phase_id)
    DO UPDATE SET assessment_template_id   = EXCLUDED.assessment_template_id,
                  start                    = EXCLUDED.start,
                  deadline                 = EXCLUDED.deadline,
                  self_evaluation_enabled  = EXCLUDED.self_evaluation_enabled,
                  self_evaluation_template = EXCLUDED.self_evaluation_template,
                  self_evaluation_start    = EXCLUDED.self_evaluation_start,
                  self_evaluation_deadline = EXCLUDED.self_evaluation_deadline,
                  peer_evaluation_enabled  = EXCLUDED.peer_evaluation_enabled,
                  peer_evaluation_template = EXCLUDED.peer_evaluation_template,
                  peer_evaluation_start    = EXCLUDED.peer_evaluation_start,
                  peer_evaluation_deadline = EXCLUDED.peer_evaluation_deadline
`

type CreateOrUpdateCoursePhaseConfigParams struct {
	AssessmentTemplateID   uuid.UUID          `json:"assessment_template_id"`
	CoursePhaseID          uuid.UUID          `json:"course_phase_id"`
	Start                  pgtype.Timestamptz `json:"start"`
	Deadline               pgtype.Timestamptz `json:"deadline"`
	SelfEvaluationEnabled  bool               `json:"self_evaluation_enabled"`
	SelfEvaluationTemplate uuid.UUID          `json:"self_evaluation_template"`
	SelfEvaluationStart    pgtype.Timestamptz `json:"self_evaluation_start"`
	SelfEvaluationDeadline pgtype.Timestamptz `json:"self_evaluation_deadline"`
	PeerEvaluationEnabled  bool               `json:"peer_evaluation_enabled"`
	PeerEvaluationTemplate uuid.UUID          `json:"peer_evaluation_template"`
	PeerEvaluationStart    pgtype.Timestamptz `json:"peer_evaluation_start"`
	PeerEvaluationDeadline pgtype.Timestamptz `json:"peer_evaluation_deadline"`
}

func (q *Queries) CreateOrUpdateCoursePhaseConfig(ctx context.Context, arg CreateOrUpdateCoursePhaseConfigParams) error {
	_, err := q.db.Exec(ctx, createOrUpdateCoursePhaseConfig,
		arg.AssessmentTemplateID,
		arg.CoursePhaseID,
		arg.Start,
		arg.Deadline,
		arg.SelfEvaluationEnabled,
		arg.SelfEvaluationTemplate,
		arg.SelfEvaluationStart,
		arg.SelfEvaluationDeadline,
		arg.PeerEvaluationEnabled,
		arg.PeerEvaluationTemplate,
		arg.PeerEvaluationStart,
		arg.PeerEvaluationDeadline,
	)
	return err
}

const getCoursePhaseConfig = `-- name: GetCoursePhaseConfig :one
SELECT assessment_template_id, course_phase_id, deadline, self_evaluation_enabled, self_evaluation_template, self_evaluation_deadline, peer_evaluation_enabled, peer_evaluation_template, peer_evaluation_deadline, start, self_evaluation_start, peer_evaluation_start
FROM course_phase_config
WHERE course_phase_id = $1
`

func (q *Queries) GetCoursePhaseConfig(ctx context.Context, coursePhaseID uuid.UUID) (CoursePhaseConfig, error) {
	row := q.db.QueryRow(ctx, getCoursePhaseConfig, coursePhaseID)
	var i CoursePhaseConfig
	err := row.Scan(
		&i.AssessmentTemplateID,
		&i.CoursePhaseID,
		&i.Deadline,
		&i.SelfEvaluationEnabled,
		&i.SelfEvaluationTemplate,
		&i.SelfEvaluationDeadline,
		&i.PeerEvaluationEnabled,
		&i.PeerEvaluationTemplate,
		&i.PeerEvaluationDeadline,
		&i.Start,
		&i.SelfEvaluationStart,
		&i.PeerEvaluationStart,
	)
	return i, err
}

const getCoursePhasesByAssessmentTemplate = `-- name: GetCoursePhasesByAssessmentTemplate :many
SELECT course_phase_id
FROM course_phase_config
WHERE assessment_template_id = $1
`

func (q *Queries) GetCoursePhasesByAssessmentTemplate(ctx context.Context, assessmentTemplateID uuid.UUID) ([]uuid.UUID, error) {
	rows, err := q.db.Query(ctx, getCoursePhasesByAssessmentTemplate, assessmentTemplateID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []uuid.UUID
	for rows.Next() {
		var course_phase_id uuid.UUID
		if err := rows.Scan(&course_phase_id); err != nil {
			return nil, err
		}
		items = append(items, course_phase_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getPeerEvaluationTimeframe = `-- name: GetPeerEvaluationTimeframe :one
SELECT peer_evaluation_start, peer_evaluation_deadline
FROM course_phase_config
WHERE course_phase_id = $1
`

type GetPeerEvaluationTimeframeRow struct {
	PeerEvaluationStart    pgtype.Timestamptz `json:"peer_evaluation_start"`
	PeerEvaluationDeadline pgtype.Timestamptz `json:"peer_evaluation_deadline"`
}

func (q *Queries) GetPeerEvaluationTimeframe(ctx context.Context, coursePhaseID uuid.UUID) (GetPeerEvaluationTimeframeRow, error) {
	row := q.db.QueryRow(ctx, getPeerEvaluationTimeframe, coursePhaseID)
	var i GetPeerEvaluationTimeframeRow
	err := row.Scan(&i.PeerEvaluationStart, &i.PeerEvaluationDeadline)
	return i, err
}

const getSelfEvaluationTimeframe = `-- name: GetSelfEvaluationTimeframe :one
SELECT self_evaluation_start, self_evaluation_deadline
FROM course_phase_config
WHERE course_phase_id = $1
`

type GetSelfEvaluationTimeframeRow struct {
	SelfEvaluationStart    pgtype.Timestamptz `json:"self_evaluation_start"`
	SelfEvaluationDeadline pgtype.Timestamptz `json:"self_evaluation_deadline"`
}

func (q *Queries) GetSelfEvaluationTimeframe(ctx context.Context, coursePhaseID uuid.UUID) (GetSelfEvaluationTimeframeRow, error) {
	row := q.db.QueryRow(ctx, getSelfEvaluationTimeframe, coursePhaseID)
	var i GetSelfEvaluationTimeframeRow
	err := row.Scan(&i.SelfEvaluationStart, &i.SelfEvaluationDeadline)
	return i, err
}

const isAssessmentDeadlinePassed = `-- name: IsAssessmentDeadlinePassed :one
SELECT CASE
           WHEN deadline < NOW() THEN true
           ELSE false
           END AS is_deadline_passed
FROM course_phase_config
WHERE course_phase_id = $1
`

func (q *Queries) IsAssessmentDeadlinePassed(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	row := q.db.QueryRow(ctx, isAssessmentDeadlinePassed, coursePhaseID)
	var is_deadline_passed bool
	err := row.Scan(&is_deadline_passed)
	return is_deadline_passed, err
}

const isAssessmentOpen = `-- name: IsAssessmentOpen :one
SELECT CASE
           WHEN start <= NOW() THEN true
           ELSE false
           END AS has_started
FROM course_phase_config
WHERE course_phase_id = $1
`

func (q *Queries) IsAssessmentOpen(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	row := q.db.QueryRow(ctx, isAssessmentOpen, coursePhaseID)
	var has_started bool
	err := row.Scan(&has_started)
	return has_started, err
}

const isPeerEvaluationDeadlinePassed = `-- name: IsPeerEvaluationDeadlinePassed :one
SELECT CASE
           WHEN peer_evaluation_deadline < NOW() THEN true
           ELSE false
           END AS is_peer_evaluation_deadline_passed
FROM course_phase_config
WHERE course_phase_id = $1
`

func (q *Queries) IsPeerEvaluationDeadlinePassed(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	row := q.db.QueryRow(ctx, isPeerEvaluationDeadlinePassed, coursePhaseID)
	var is_peer_evaluation_deadline_passed bool
	err := row.Scan(&is_peer_evaluation_deadline_passed)
	return is_peer_evaluation_deadline_passed, err
}

const isPeerEvaluationOpen = `-- name: IsPeerEvaluationOpen :one
SELECT CASE
           WHEN peer_evaluation_enabled AND peer_evaluation_start <= NOW() THEN true
           ELSE false
           END AS has_peer_evaluation_started
FROM course_phase_config
WHERE course_phase_id = $1
`

func (q *Queries) IsPeerEvaluationOpen(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	row := q.db.QueryRow(ctx, isPeerEvaluationOpen, coursePhaseID)
	var has_peer_evaluation_started bool
	err := row.Scan(&has_peer_evaluation_started)
	return has_peer_evaluation_started, err
}

const isSelfEvaluationDeadlinePassed = `-- name: IsSelfEvaluationDeadlinePassed :one
SELECT CASE
           WHEN self_evaluation_enabled AND self_evaluation_deadline < NOW() THEN true
           ELSE false
           END AS is_self_evaluation_deadline_passed
FROM course_phase_config
WHERE course_phase_id = $1
`

func (q *Queries) IsSelfEvaluationDeadlinePassed(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	row := q.db.QueryRow(ctx, isSelfEvaluationDeadlinePassed, coursePhaseID)
	var is_self_evaluation_deadline_passed bool
	err := row.Scan(&is_self_evaluation_deadline_passed)
	return is_self_evaluation_deadline_passed, err
}

const isSelfEvaluationOpen = `-- name: IsSelfEvaluationOpen :one
SELECT CASE
           WHEN self_evaluation_enabled AND self_evaluation_start <= NOW() THEN true
           ELSE false
           END AS has_self_evaluation_started
FROM course_phase_config
WHERE course_phase_id = $1
`

func (q *Queries) IsSelfEvaluationOpen(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	row := q.db.QueryRow(ctx, isSelfEvaluationOpen, coursePhaseID)
	var has_self_evaluation_started bool
	err := row.Scan(&has_self_evaluation_started)
	return has_self_evaluation_started, err
}

const listAssessmentTemplateCoursePhaseMappings = `-- name: ListAssessmentTemplateCoursePhaseMappings :many
SELECT assessment_template_id, course_phase_id, deadline, self_evaluation_enabled, self_evaluation_template, self_evaluation_deadline, peer_evaluation_enabled, peer_evaluation_template, peer_evaluation_deadline, start, self_evaluation_start, peer_evaluation_start
FROM course_phase_config
ORDER BY assessment_template_id, course_phase_id
`

func (q *Queries) ListAssessmentTemplateCoursePhaseMappings(ctx context.Context) ([]CoursePhaseConfig, error) {
	rows, err := q.db.Query(ctx, listAssessmentTemplateCoursePhaseMappings)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CoursePhaseConfig
	for rows.Next() {
		var i CoursePhaseConfig
		if err := rows.Scan(
			&i.AssessmentTemplateID,
			&i.CoursePhaseID,
			&i.Deadline,
			&i.SelfEvaluationEnabled,
			&i.SelfEvaluationTemplate,
			&i.SelfEvaluationDeadline,
			&i.PeerEvaluationEnabled,
			&i.PeerEvaluationTemplate,
			&i.PeerEvaluationDeadline,
			&i.Start,
			&i.SelfEvaluationStart,
			&i.PeerEvaluationStart,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
