// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: competency_map.sql

package db

import (
	"context"

	"github.com/google/uuid"
)

const createCompetencyMap = `-- name: CreateCompetencyMap :exec
INSERT INTO competency_map (from_competency_id, to_competency_id)
VALUES ($1, $2)
`

type CreateCompetencyMapParams struct {
	FromCompetencyID uuid.UUID `json:"from_competency_id"`
	ToCompetencyID   uuid.UUID `json:"to_competency_id"`
}

func (q *Queries) CreateCompetencyMap(ctx context.Context, arg CreateCompetencyMapParams) error {
	_, err := q.db.Exec(ctx, createCompetencyMap, arg.FromCompetencyID, arg.ToCompetencyID)
	return err
}

const deleteCompetencyMap = `-- name: DeleteCompetencyMap :exec
DELETE FROM competency_map
WHERE from_competency_id = $1 AND to_competency_id = $2
`

type DeleteCompetencyMapParams struct {
	FromCompetencyID uuid.UUID `json:"from_competency_id"`
	ToCompetencyID   uuid.UUID `json:"to_competency_id"`
}

func (q *Queries) DeleteCompetencyMap(ctx context.Context, arg DeleteCompetencyMapParams) error {
	_, err := q.db.Exec(ctx, deleteCompetencyMap, arg.FromCompetencyID, arg.ToCompetencyID)
	return err
}

const getAllCompetencyMappings = `-- name: GetAllCompetencyMappings :many
SELECT from_competency_id, to_competency_id
FROM competency_map
`

func (q *Queries) GetAllCompetencyMappings(ctx context.Context) ([]CompetencyMap, error) {
	rows, err := q.db.Query(ctx, getAllCompetencyMappings)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CompetencyMap
	for rows.Next() {
		var i CompetencyMap
		if err := rows.Scan(&i.FromCompetencyID, &i.ToCompetencyID); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getCompetencyMappings = `-- name: GetCompetencyMappings :many
SELECT from_competency_id, to_competency_id
FROM competency_map
WHERE from_competency_id = $1
`

func (q *Queries) GetCompetencyMappings(ctx context.Context, fromCompetencyID uuid.UUID) ([]CompetencyMap, error) {
	rows, err := q.db.Query(ctx, getCompetencyMappings, fromCompetencyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CompetencyMap
	for rows.Next() {
		var i CompetencyMap
		if err := rows.Scan(&i.FromCompetencyID, &i.ToCompetencyID); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getEvaluationsByMappedCompetency = `-- name: GetEvaluationsByMappedCompetency :many
SELECT e.id, e.course_participation_id, e.course_phase_id, e.competency_id, e.score_level, e.author_course_participation_id, e.evaluated_at
FROM evaluation e
JOIN competency_map cm ON e.competency_id = cm.from_competency_id
WHERE cm.to_competency_id = $1
`

func (q *Queries) GetEvaluationsByMappedCompetency(ctx context.Context, toCompetencyID uuid.UUID) ([]Evaluation, error) {
	rows, err := q.db.Query(ctx, getEvaluationsByMappedCompetency, toCompetencyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Evaluation
	for rows.Next() {
		var i Evaluation
		if err := rows.Scan(
			&i.ID,
			&i.CourseParticipationID,
			&i.CoursePhaseID,
			&i.CompetencyID,
			&i.ScoreLevel,
			&i.AuthorCourseParticipationID,
			&i.EvaluatedAt,
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

const getReverseCompetencyMappings = `-- name: GetReverseCompetencyMappings :many
SELECT from_competency_id, to_competency_id
FROM competency_map
WHERE to_competency_id = $1
`

func (q *Queries) GetReverseCompetencyMappings(ctx context.Context, toCompetencyID uuid.UUID) ([]CompetencyMap, error) {
	rows, err := q.db.Query(ctx, getReverseCompetencyMappings, toCompetencyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CompetencyMap
	for rows.Next() {
		var i CompetencyMap
		if err := rows.Scan(&i.FromCompetencyID, &i.ToCompetencyID); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
