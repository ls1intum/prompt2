// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: course_phase_participation.sql

package db

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const createCoursePhaseParticipation = `-- name: CreateCoursePhaseParticipation :one
INSERT INTO course_phase_participation (id, course_participation_id, course_phase_id, passed, meta_data)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, course_participation_id, course_phase_id, passed, meta_data
`

type CreateCoursePhaseParticipationParams struct {
	ID                    uuid.UUID   `json:"id"`
	CourseParticipationID uuid.UUID   `json:"course_participation_id"`
	CoursePhaseID         uuid.UUID   `json:"course_phase_id"`
	Passed                pgtype.Bool `json:"passed"`
	MetaData              []byte      `json:"meta_data"`
}

func (q *Queries) CreateCoursePhaseParticipation(ctx context.Context, arg CreateCoursePhaseParticipationParams) (CoursePhaseParticipation, error) {
	row := q.db.QueryRow(ctx, createCoursePhaseParticipation,
		arg.ID,
		arg.CourseParticipationID,
		arg.CoursePhaseID,
		arg.Passed,
		arg.MetaData,
	)
	var i CoursePhaseParticipation
	err := row.Scan(
		&i.ID,
		&i.CourseParticipationID,
		&i.CoursePhaseID,
		&i.Passed,
		&i.MetaData,
	)
	return i, err
}

const getAllCoursePhaseParticipationsForCourseParticipation = `-- name: GetAllCoursePhaseParticipationsForCourseParticipation :many
SELECT id, course_participation_id, course_phase_id, passed, meta_data FROM course_phase_participation
WHERE course_participation_id = $1
`

func (q *Queries) GetAllCoursePhaseParticipationsForCourseParticipation(ctx context.Context, courseParticipationID uuid.UUID) ([]CoursePhaseParticipation, error) {
	rows, err := q.db.Query(ctx, getAllCoursePhaseParticipationsForCourseParticipation, courseParticipationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CoursePhaseParticipation
	for rows.Next() {
		var i CoursePhaseParticipation
		if err := rows.Scan(
			&i.ID,
			&i.CourseParticipationID,
			&i.CoursePhaseID,
			&i.Passed,
			&i.MetaData,
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

const getAllCoursePhaseParticipationsForCoursePhase = `-- name: GetAllCoursePhaseParticipationsForCoursePhase :many
SELECT id, course_participation_id, course_phase_id, passed, meta_data FROM course_phase_participation
WHERE course_phase_id = $1
`

func (q *Queries) GetAllCoursePhaseParticipationsForCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]CoursePhaseParticipation, error) {
	rows, err := q.db.Query(ctx, getAllCoursePhaseParticipationsForCoursePhase, coursePhaseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CoursePhaseParticipation
	for rows.Next() {
		var i CoursePhaseParticipation
		if err := rows.Scan(
			&i.ID,
			&i.CourseParticipationID,
			&i.CoursePhaseID,
			&i.Passed,
			&i.MetaData,
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

const getCoursePhaseParticipation = `-- name: GetCoursePhaseParticipation :one
SELECT id, course_participation_id, course_phase_id, passed, meta_data FROM course_phase_participation
WHERE id = $1 LIMIT 1
`

func (q *Queries) GetCoursePhaseParticipation(ctx context.Context, id uuid.UUID) (CoursePhaseParticipation, error) {
	row := q.db.QueryRow(ctx, getCoursePhaseParticipation, id)
	var i CoursePhaseParticipation
	err := row.Scan(
		&i.ID,
		&i.CourseParticipationID,
		&i.CoursePhaseID,
		&i.Passed,
		&i.MetaData,
	)
	return i, err
}

const updateCoursePhaseParticipation = `-- name: UpdateCoursePhaseParticipation :one
UPDATE course_phase_participation
SET 
    passed = COALESCE($2, passed),
    meta_data = meta_data || $3
WHERE id = $1
RETURNING id, course_participation_id, course_phase_id, passed, meta_data
`

type UpdateCoursePhaseParticipationParams struct {
	ID       uuid.UUID   `json:"id"`
	Passed   pgtype.Bool `json:"passed"`
	MetaData []byte      `json:"meta_data"`
}

func (q *Queries) UpdateCoursePhaseParticipation(ctx context.Context, arg UpdateCoursePhaseParticipationParams) (CoursePhaseParticipation, error) {
	row := q.db.QueryRow(ctx, updateCoursePhaseParticipation, arg.ID, arg.Passed, arg.MetaData)
	var i CoursePhaseParticipation
	err := row.Scan(
		&i.ID,
		&i.CourseParticipationID,
		&i.CoursePhaseID,
		&i.Passed,
		&i.MetaData,
	)
	return i, err
}
