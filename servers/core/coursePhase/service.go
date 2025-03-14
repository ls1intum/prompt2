package coursePhase

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type CoursePhaseService struct {
	queries db.Queries
	conn    *pgxpool.Pool
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

func DeleteCoursePhase(ctx context.Context, id uuid.UUID) error {
	return CoursePhaseServiceSingleton.queries.DeleteCoursePhase(ctx, id)
}

func CheckCoursePhasesBelongToCourse(ctx context.Context, courseId uuid.UUID, coursePhaseIds []uuid.UUID) (bool, error) {
	ok, err := CoursePhaseServiceSingleton.queries.CheckCoursePhasesBelongToCourse(ctx, db.CheckCoursePhasesBelongToCourseParams{
		CourseID: courseId,
		Column1:  coursePhaseIds,
	})

	if err != nil {
		log.Error(err)
		return false, errors.New("error checking course phases")
	}

	return ok, nil
}
