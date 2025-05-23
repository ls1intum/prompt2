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

const getTeamWithStudentNamesByID = `-- name: GetTeamWithStudentNamesByID :one
SELECT
  t.id,
  t.name,
  -- build a JSON array of {courseParticipationID, studentName}
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'courseParticipationID', a.course_participation_id,
        'studentName',           a.student_full_name
      )
      ORDER BY a.student_full_name
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::jsonb
  )::jsonb AS team_members
FROM
  team t
LEFT JOIN
  assignments a
  ON t.id = a.team_id
WHERE
  t.id = $1
GROUP BY
  t.id, t.name
`

type GetTeamWithStudentNamesByIDRow struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	TeamMembers []byte    `json:"team_members"`
}

func (q *Queries) GetTeamWithStudentNamesByID(ctx context.Context, id uuid.UUID) (GetTeamWithStudentNamesByIDRow, error) {
	row := q.db.QueryRow(ctx, getTeamWithStudentNamesByID, id)
	var i GetTeamWithStudentNamesByIDRow
	err := row.Scan(&i.ID, &i.Name, &i.TeamMembers)
	return i, err
}

const getTeamWithStudentNamesByTeamID = `-- name: GetTeamWithStudentNamesByTeamID :one
SELECT
  t.id,
  t.name,
  -- build a JSON array of {courseParticipationID, studentName}
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'courseParticipationID', a.course_participation_id,
        'studentName',           a.student_full_name
      )
      ORDER BY a.student_full_name
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::jsonb
  )::jsonb AS team_members
FROM
  team t
LEFT JOIN
  assignments a
  ON t.id = a.team_id
WHERE
  t.course_phase_id = $1
  AND t.id = $2
GROUP BY
  t.id, t.name
ORDER BY
  t.name
`

type GetTeamWithStudentNamesByTeamIDParams struct {
	CoursePhaseID uuid.UUID `json:"course_phase_id"`
	ID            uuid.UUID `json:"id"`
}

type GetTeamWithStudentNamesByTeamIDRow struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	TeamMembers []byte    `json:"team_members"`
}

func (q *Queries) GetTeamWithStudentNamesByTeamID(ctx context.Context, arg GetTeamWithStudentNamesByTeamIDParams) (GetTeamWithStudentNamesByTeamIDRow, error) {
	row := q.db.QueryRow(ctx, getTeamWithStudentNamesByTeamID, arg.CoursePhaseID, arg.ID)
	var i GetTeamWithStudentNamesByTeamIDRow
	err := row.Scan(&i.ID, &i.Name, &i.TeamMembers)
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

const getTeamsWithStudentNames = `-- name: GetTeamsWithStudentNames :many
SELECT
  t.id,
  t.name,
  -- build a JSON array of {courseParticipationID, studentName}
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'courseParticipationID', a.course_participation_id,
        'studentName',           a.student_full_name
      )
      ORDER BY a.student_full_name
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::jsonb
  )::jsonb AS team_members
FROM
  team t
LEFT JOIN
  assignments a
  ON t.id = a.team_id
WHERE
  t.course_phase_id = $1
GROUP BY
  t.id, t.name
ORDER BY
  t.name
`

type GetTeamsWithStudentNamesRow struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	TeamMembers []byte    `json:"team_members"`
}

func (q *Queries) GetTeamsWithStudentNames(ctx context.Context, coursePhaseID uuid.UUID) ([]GetTeamsWithStudentNamesRow, error) {
	rows, err := q.db.Query(ctx, getTeamsWithStudentNames, coursePhaseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetTeamsWithStudentNamesRow
	for rows.Next() {
		var i GetTeamsWithStudentNamesRow
		if err := rows.Scan(&i.ID, &i.Name, &i.TeamMembers); err != nil {
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
