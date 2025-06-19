package coursePhaseConfig

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig/coursePhaseConfigDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CoursePhaseConfigService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CoursePhaseConfigSingleton *CoursePhaseConfigService

// UpdateCoursePhaseDeadline updates the deadline for a specific course phase
func UpdateCoursePhaseDeadline(ctx context.Context, coursePhaseID uuid.UUID, request coursePhaseConfigDTO.UpdateDeadlineRequest) error {
	params := db.UpdateCoursePhaseDeadlineParams{
		Deadline: pgtype.Timestamptz{
			Time:  request.Deadline,
			Valid: true,
		},
		CoursePhaseID: coursePhaseID,
	}

	return CoursePhaseConfigSingleton.queries.UpdateCoursePhaseDeadline(ctx, params)
}
