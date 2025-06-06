// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: meta_data_graph.sql

package db

import (
	"context"

	"github.com/google/uuid"
)

const createParticipationDataConnection = `-- name: CreateParticipationDataConnection :exec
INSERT INTO participation_data_dependency_graph (from_course_phase_id, to_course_phase_id, from_course_phase_DTO_id, to_course_phase_DTO_id)
VALUES ($1, $2, $3, $4)
`

type CreateParticipationDataConnectionParams struct {
	FromCoursePhaseID    uuid.UUID `json:"from_course_phase_id"`
	ToCoursePhaseID      uuid.UUID `json:"to_course_phase_id"`
	FromCoursePhaseDtoID uuid.UUID `json:"from_course_phase_dto_id"`
	ToCoursePhaseDtoID   uuid.UUID `json:"to_course_phase_dto_id"`
}

func (q *Queries) CreateParticipationDataConnection(ctx context.Context, arg CreateParticipationDataConnectionParams) error {
	_, err := q.db.Exec(ctx, createParticipationDataConnection,
		arg.FromCoursePhaseID,
		arg.ToCoursePhaseID,
		arg.FromCoursePhaseDtoID,
		arg.ToCoursePhaseDtoID,
	)
	return err
}

const createPhaseDataConnection = `-- name: CreatePhaseDataConnection :exec
INSERT INTO phase_data_dependency_graph (from_course_phase_id, to_course_phase_id, from_course_phase_DTO_id, to_course_phase_DTO_id)
VALUES ($1, $2, $3, $4)
`

type CreatePhaseDataConnectionParams struct {
	FromCoursePhaseID    uuid.UUID `json:"from_course_phase_id"`
	ToCoursePhaseID      uuid.UUID `json:"to_course_phase_id"`
	FromCoursePhaseDtoID uuid.UUID `json:"from_course_phase_dto_id"`
	ToCoursePhaseDtoID   uuid.UUID `json:"to_course_phase_dto_id"`
}

func (q *Queries) CreatePhaseDataConnection(ctx context.Context, arg CreatePhaseDataConnectionParams) error {
	_, err := q.db.Exec(ctx, createPhaseDataConnection,
		arg.FromCoursePhaseID,
		arg.ToCoursePhaseID,
		arg.FromCoursePhaseDtoID,
		arg.ToCoursePhaseDtoID,
	)
	return err
}

const deleteParticipationDataGraphConnections = `-- name: DeleteParticipationDataGraphConnections :exec
DELETE FROM participation_data_dependency_graph
WHERE from_course_phase_id IN 
    (SELECT id FROM course_phase WHERE course_id = $1)
`

func (q *Queries) DeleteParticipationDataGraphConnections(ctx context.Context, courseID uuid.UUID) error {
	_, err := q.db.Exec(ctx, deleteParticipationDataGraphConnections, courseID)
	return err
}

const deletePhaseDataGraphConnections = `-- name: DeletePhaseDataGraphConnections :exec
DELETE FROM phase_data_dependency_graph
WHERE from_course_phase_id IN 
    (SELECT id FROM course_phase WHERE course_id = $1)
`

func (q *Queries) DeletePhaseDataGraphConnections(ctx context.Context, courseID uuid.UUID) error {
	_, err := q.db.Exec(ctx, deletePhaseDataGraphConnections, courseID)
	return err
}

const getParticipationDataGraph = `-- name: GetParticipationDataGraph :many
SELECT mg.from_course_phase_id, mg.to_course_phase_id, mg.from_course_phase_dto_id, mg.to_course_phase_dto_id
FROM participation_data_dependency_graph mg
JOIN course_phase cp
  ON mg.from_course_phase_id = cp.id
WHERE cp.course_id = $1
`

func (q *Queries) GetParticipationDataGraph(ctx context.Context, courseID uuid.UUID) ([]ParticipationDataDependencyGraph, error) {
	rows, err := q.db.Query(ctx, getParticipationDataGraph, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ParticipationDataDependencyGraph
	for rows.Next() {
		var i ParticipationDataDependencyGraph
		if err := rows.Scan(
			&i.FromCoursePhaseID,
			&i.ToCoursePhaseID,
			&i.FromCoursePhaseDtoID,
			&i.ToCoursePhaseDtoID,
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

const getPhaseDataGraph = `-- name: GetPhaseDataGraph :many
SELECT mg.from_course_phase_id, mg.to_course_phase_id, mg.from_course_phase_dto_id, mg.to_course_phase_dto_id
FROM phase_data_dependency_graph mg
JOIN course_phase cp
  ON mg.from_course_phase_id = cp.id
WHERE cp.course_id = $1
`

func (q *Queries) GetPhaseDataGraph(ctx context.Context, courseID uuid.UUID) ([]PhaseDataDependencyGraph, error) {
	rows, err := q.db.Query(ctx, getPhaseDataGraph, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []PhaseDataDependencyGraph
	for rows.Next() {
		var i PhaseDataDependencyGraph
		if err := rows.Scan(
			&i.FromCoursePhaseID,
			&i.ToCoursePhaseID,
			&i.FromCoursePhaseDtoID,
			&i.ToCoursePhaseDtoID,
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
