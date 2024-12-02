package coursePhase

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CoursePhaseService struct {
	queries db.Queries
	conn    *pgx.Conn
}

var CoursePhaseServiceSingleton *CoursePhaseService

func GetCoursePhaseByID(ctx context.Context, id uuid.UUID) (coursePhaseDTO.CoursePhase, error) {
	coursePhase, err := CoursePhaseServiceSingleton.queries.GetCoursePhase(ctx, id)
	if err != nil {
		return coursePhaseDTO.CoursePhase{}, err
	}

	return coursePhaseDTO.GetCoursePhaseDTOFromDBModel(coursePhase)
}

func UpdateCoursePhase(ctx context.Context, coursePhase coursePhaseDTO.UpdateCoursePhase) error {
	dbModel, err := coursePhase.GetDBModel()
	if err != nil {
		return err
	}

	dbModel.ID = coursePhase.ID
	return CoursePhaseServiceSingleton.queries.UpdateCoursePhase(ctx, dbModel)
}

func CreateCoursePhase(ctx context.Context, coursePhase coursePhaseDTO.CreateCoursePhase) (coursePhaseDTO.CoursePhase, error) {
	dbModel, err := coursePhase.GetDBModel()
	if err != nil {
		return coursePhaseDTO.CoursePhase{}, err
	}

	dbModel.ID = uuid.New()
	createdCoursePhase, err := CoursePhaseServiceSingleton.queries.CreateCoursePhase(ctx, dbModel)
	if err != nil {
		return coursePhaseDTO.CoursePhase{}, err
	}

	return GetCoursePhaseByID(ctx, createdCoursePhase.ID)
}
