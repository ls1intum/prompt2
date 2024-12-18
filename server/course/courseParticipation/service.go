package courseParticipation

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/course/courseParticipation/courseParticipationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CourseParticipationService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CourseParticipationServiceSingleton *CourseParticipationService

func GetAllCourseParticipationsForCourse(ctx context.Context, id uuid.UUID) ([]courseParticipationDTO.GetCourseParticipation, error) {
	courseParticipations, err := CourseParticipationServiceSingleton.queries.GetAllCourseParticipationsForCourse(ctx, id)
	if err != nil {
		return nil, err
	}

	dtoCourseParticipations := make([]courseParticipationDTO.GetCourseParticipation, 0, len(courseParticipations))
	for _, courseParticipation := range courseParticipations {
		dtoCourseParticipation := courseParticipationDTO.GetCourseParticipationDTOFromDBModel(courseParticipation)
		dtoCourseParticipations = append(dtoCourseParticipations, dtoCourseParticipation)
	}

	return dtoCourseParticipations, nil
}

func GetAllCourseParticipationsForStudent(ctx context.Context, id uuid.UUID) ([]courseParticipationDTO.GetCourseParticipation, error) {
	courseParticipations, err := CourseParticipationServiceSingleton.queries.GetAllCourseParticipationsForStudent(ctx, id)
	if err != nil {
		return nil, err
	}

	dtoCourseParticipations := make([]courseParticipationDTO.GetCourseParticipation, 0, len(courseParticipations))
	for _, courseParticipation := range courseParticipations {
		dtoCourseParticipation := courseParticipationDTO.GetCourseParticipationDTOFromDBModel(courseParticipation)
		dtoCourseParticipations = append(dtoCourseParticipations, dtoCourseParticipation)
	}

	return dtoCourseParticipations, nil
}

func CreateCourseParticipation(ctx context.Context, c courseParticipationDTO.CreateCourseParticipation) (courseParticipationDTO.GetCourseParticipation, error) {
	courseParticipation := c.GetDBModel()
	courseParticipation.ID = uuid.New()

	createdParticipation, err := CourseParticipationServiceSingleton.queries.CreateCourseParticipation(ctx, courseParticipation)
	if err != nil {
		return courseParticipationDTO.GetCourseParticipation{}, err
	}

	return courseParticipationDTO.GetCourseParticipationDTOFromDBModel(createdParticipation), nil
}
