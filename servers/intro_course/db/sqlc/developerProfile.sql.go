// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: developerProfile.sql

package db

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const createDeveloperProfile = `-- name: CreateDeveloperProfile :exec
INSERT INTO developer_profile (course_participation_id, course_phase_id, gitlab_username, apple_id, has_macbook, iphone_udid, ipad_udid, apple_watch_udid)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
`

type CreateDeveloperProfileParams struct {
	CourseParticipationID uuid.UUID   `json:"course_participation_id"`
	CoursePhaseID         uuid.UUID   `json:"course_phase_id"`
	GitlabUsername        string      `json:"gitlab_username"`
	AppleID               string      `json:"apple_id"`
	HasMacbook            bool        `json:"has_macbook"`
	IphoneUdid            pgtype.Text `json:"iphone_udid"`
	IpadUdid              pgtype.Text `json:"ipad_udid"`
	AppleWatchUdid        pgtype.Text `json:"apple_watch_udid"`
}

func (q *Queries) CreateDeveloperProfile(ctx context.Context, arg CreateDeveloperProfileParams) error {
	_, err := q.db.Exec(ctx, createDeveloperProfile,
		arg.CourseParticipationID,
		arg.CoursePhaseID,
		arg.GitlabUsername,
		arg.AppleID,
		arg.HasMacbook,
		arg.IphoneUdid,
		arg.IpadUdid,
		arg.AppleWatchUdid,
	)
	return err
}

const createOrUpdateDeveloperProfile = `-- name: CreateOrUpdateDeveloperProfile :exec
INSERT INTO developer_profile (
  course_participation_id,
  course_phase_id,
  gitlab_username,
  apple_id,
  has_macbook,
  iphone_udid,
  ipad_udid,
  apple_watch_udid
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (course_phase_id, course_participation_id)
DO UPDATE SET 
  gitlab_username   = EXCLUDED.gitlab_username,
  apple_id          = EXCLUDED.apple_id,
  has_macbook       = EXCLUDED.has_macbook,
  iphone_udid       = EXCLUDED.iphone_udid,
  ipad_udid         = EXCLUDED.ipad_udid,
  apple_watch_udid  = EXCLUDED.apple_watch_udid
`

type CreateOrUpdateDeveloperProfileParams struct {
	CourseParticipationID uuid.UUID   `json:"course_participation_id"`
	CoursePhaseID         uuid.UUID   `json:"course_phase_id"`
	GitlabUsername        string      `json:"gitlab_username"`
	AppleID               string      `json:"apple_id"`
	HasMacbook            bool        `json:"has_macbook"`
	IphoneUdid            pgtype.Text `json:"iphone_udid"`
	IpadUdid              pgtype.Text `json:"ipad_udid"`
	AppleWatchUdid        pgtype.Text `json:"apple_watch_udid"`
}

func (q *Queries) CreateOrUpdateDeveloperProfile(ctx context.Context, arg CreateOrUpdateDeveloperProfileParams) error {
	_, err := q.db.Exec(ctx, createOrUpdateDeveloperProfile,
		arg.CourseParticipationID,
		arg.CoursePhaseID,
		arg.GitlabUsername,
		arg.AppleID,
		arg.HasMacbook,
		arg.IphoneUdid,
		arg.IpadUdid,
		arg.AppleWatchUdid,
	)
	return err
}

const getAllDeveloperProfiles = `-- name: GetAllDeveloperProfiles :many
SELECT course_phase_id, course_participation_id, gitlab_username, apple_id, has_macbook, iphone_udid, ipad_udid, apple_watch_udid 
FROM developer_profile
WHERE course_phase_id = $1
`

func (q *Queries) GetAllDeveloperProfiles(ctx context.Context, coursePhaseID uuid.UUID) ([]DeveloperProfile, error) {
	rows, err := q.db.Query(ctx, getAllDeveloperProfiles, coursePhaseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []DeveloperProfile
	for rows.Next() {
		var i DeveloperProfile
		if err := rows.Scan(
			&i.CoursePhaseID,
			&i.CourseParticipationID,
			&i.GitlabUsername,
			&i.AppleID,
			&i.HasMacbook,
			&i.IphoneUdid,
			&i.IpadUdid,
			&i.AppleWatchUdid,
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

const getDeveloperProfileByCourseParticipationID = `-- name: GetDeveloperProfileByCourseParticipationID :one
SELECT course_phase_id, course_participation_id, gitlab_username, apple_id, has_macbook, iphone_udid, ipad_udid, apple_watch_udid
FROM developer_profile
WHERE course_participation_id = $1 
AND course_phase_id = $2
`

type GetDeveloperProfileByCourseParticipationIDParams struct {
	CourseParticipationID uuid.UUID `json:"course_participation_id"`
	CoursePhaseID         uuid.UUID `json:"course_phase_id"`
}

func (q *Queries) GetDeveloperProfileByCourseParticipationID(ctx context.Context, arg GetDeveloperProfileByCourseParticipationIDParams) (DeveloperProfile, error) {
	row := q.db.QueryRow(ctx, getDeveloperProfileByCourseParticipationID, arg.CourseParticipationID, arg.CoursePhaseID)
	var i DeveloperProfile
	err := row.Scan(
		&i.CoursePhaseID,
		&i.CourseParticipationID,
		&i.GitlabUsername,
		&i.AppleID,
		&i.HasMacbook,
		&i.IphoneUdid,
		&i.IpadUdid,
		&i.AppleWatchUdid,
	)
	return i, err
}
