package coursePhaseConfig

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CoursePhaseConfigService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CoursePhaseConfigSingleton *CoursePhaseConfigService

// NewCoursePhaseConfigService creates a new CoursePhaseConfigService instance
func NewCoursePhaseConfigService(queries db.Queries, conn *pgxpool.Pool) *CoursePhaseConfigService {
	return &CoursePhaseConfigService{
		queries: queries,
		conn:    conn,
	}
}

func UpdateCoursePhaseDeadline(ctx context.Context, coursePhaseID uuid.UUID, deadline time.Time) error {
	params := db.UpdateCoursePhaseDeadlineParams{
		Deadline: pgtype.Timestamptz{
			Time:  deadline,
			Valid: true,
		},
		CoursePhaseID: coursePhaseID,
	}

	return CoursePhaseConfigSingleton.queries.UpdateCoursePhaseDeadline(ctx, params)
}

func GetCoursePhaseDeadline(ctx context.Context, coursePhaseID uuid.UUID) (*time.Time, error) {
	deadline, err := CoursePhaseConfigSingleton.queries.GetCoursePhaseDeadline(ctx, coursePhaseID)
	if err != nil && errors.Is(err, sql.ErrNoRows) {
		// No deadline found for this course phase, return nil
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	var response *time.Time
	if deadline.Valid {
		response = &deadline.Time
	}

	return response, nil
}
