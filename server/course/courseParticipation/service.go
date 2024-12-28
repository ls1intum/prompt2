package courseParticipation

import (
	"context"
	"database/sql"
	"errors"

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

func CreateIfNotExistingCourseParticipation(ctx context.Context, studentID uuid.UUID, courseID uuid.UUID) (courseParticipationDTO.GetCourseParticipation, error) {
	participation, err := CourseParticipationServiceSingleton.queries.GetCourseParticipationByStudentAndCourseID(ctx, db.GetCourseParticipationByStudentAndCourseIDParams{
		StudentID: studentID,
		CourseID:  courseID,
	})
	if err == nil {
		return courseParticipationDTO.GetCourseParticipationDTOFromDBModel(participation), nil
	} else if errors.Is(err, sql.ErrNoRows) {
		// has to be created
		return CreateCourseParticipation(ctx, courseParticipationDTO.CreateCourseParticipation{
			StudentID: studentID,
			CourseID:  courseID,
		})

	} else {
		return courseParticipationDTO.GetCourseParticipation{}, err
	}
}
