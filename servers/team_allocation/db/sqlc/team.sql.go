// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: team.sql

package db

import (
	"context"

	"github.com/google/uuid"
)

const createTeam = `-- name: CreateTeam :exec

INSERT INTO team (id, name, course_phase_id)
VALUES ($1, $2, $3)
`

type CreateTeamParams struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	CoursePhaseID uuid.UUID `json:"course_phase_id"`
}

// ensuring to get only teams in the authenticated course_phase
func (q *Queries) CreateTeam(ctx context.Context, arg CreateTeamParams) error {
	_, err := q.db.Exec(ctx, createTeam, arg.ID, arg.Name, arg.CoursePhaseID)
	return err
}

const deleteTeam = `-- name: DeleteTeam :exec

DELETE FROM team
WHERE id = $1
AND course_phase_id = $2
`

type DeleteTeamParams struct {
	ID            uuid.UUID `json:"id"`
	CoursePhaseID uuid.UUID `json:"course_phase_id"`
}

// ensuring to update only teams in the authenticated course_phase
func (q *Queries) DeleteTeam(ctx context.Context, arg DeleteTeamParams) error {
	_, err := q.db.Exec(ctx, deleteTeam, arg.ID, arg.CoursePhaseID)
	return err
}

const getTeamByCoursePhaseAndTeamID = `-- name: GetTeamByCoursePhaseAndTeamID :one
SELECT id, name, course_phase_id, created_at
FROM team
WHERE id = $1
AND course_phase_id = $2
`

type GetTeamByCoursePhaseAndTeamIDParams struct {
	ID            uuid.UUID `json:"id"`
	CoursePhaseID uuid.UUID `json:"course_phase_id"`
}

func (q *Queries) GetTeamByCoursePhaseAndTeamID(ctx context.Context, arg GetTeamByCoursePhaseAndTeamIDParams) (Team, error) {
	row := q.db.QueryRow(ctx, getTeamByCoursePhaseAndTeamID, arg.ID, arg.CoursePhaseID)
	var i Team
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.CoursePhaseID,
		&i.CreatedAt,
	)
	return i, err
}

const getTeamsByCoursePhase = `-- name: GetTeamsByCoursePhase :many
SELECT id, name, course_phase_id, created_at
FROM team
WHERE course_phase_id = $1
ORDER BY name
`

func (q *Queries) GetTeamsByCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]Team, error) {
	rows, err := q.db.Query(ctx, getTeamsByCoursePhase, coursePhaseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Team
	for rows.Next() {
		var i Team
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.CoursePhaseID,
			&i.CreatedAt,
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

const updateTeam = `-- name: UpdateTeam :exec
UPDATE team
SET name = $3
WHERE id = $1
AND course_phase_id = $2
`

type UpdateTeamParams struct {
	ID            uuid.UUID `json:"id"`
	CoursePhaseID uuid.UUID `json:"course_phase_id"`
	Name          string    `json:"name"`
}

func (q *Queries) UpdateTeam(ctx context.Context, arg UpdateTeamParams) error {
	_, err := q.db.Exec(ctx, updateTeam, arg.ID, arg.CoursePhaseID, arg.Name)
	return err
}
