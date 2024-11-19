package coursePhaseParticipation

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CoursePhaseParticipationService struct {
	queries db.Queries
	conn    *pgx.Conn
}

var CoursePhaseParticipationServiceSingleton *CoursePhaseParticipationService

func GetAllParticipationsForCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]coursePhaseParticipationDTO.GetCoursePhaseParticipation, error) {
	coursePhaseParticipations, err := CoursePhaseParticipationServiceSingleton.queries.GetAllCoursePhaseParticipationsForCoursePhase(ctx, coursePhaseID)
	if err != nil {
		return nil, err
	}

	participationDTOs := make([]coursePhaseParticipationDTO.GetCoursePhaseParticipation, 0, len(coursePhaseParticipations))
	for _, coursePhaseParticipation := range coursePhaseParticipations {
		dto, err := coursePhaseParticipationDTO.GetCoursePhaseParticipationDTOFromDBModel(coursePhaseParticipation)
		if err != nil {
			return nil, err
		}
		participationDTOs = append(participationDTOs, dto)
	}

	return participationDTOs, nil
}

func CreateCoursePhaseParticipation(ctx context.Context, newCoursePhaseParticipation coursePhaseParticipationDTO.CreateCoursePhaseParticipation) (coursePhaseParticipationDTO.GetCoursePhaseParticipation, error) {
	participation, err := newCoursePhaseParticipation.GetDBModel()
	if err != nil {
		return coursePhaseParticipationDTO.GetCoursePhaseParticipation{}, err
	}

	participation.ID = uuid.New()

	createdParticipation, err := CoursePhaseParticipationServiceSingleton.queries.CreateCoursePhaseParticipation(ctx, participation)
	if err != nil {
		return coursePhaseParticipationDTO.GetCoursePhaseParticipation{}, err
	}

	return coursePhaseParticipationDTO.GetCoursePhaseParticipationDTOFromDBModel(createdParticipation)
}

func UpdateCoursePhaseParticipation(ctx context.Context, updatedCoursePhaseParticipation coursePhaseParticipationDTO.UpdateCoursePhaseParticipation) (coursePhaseParticipationDTO.UpdateCoursePhaseParticipation, error) {
	participation, err := updatedCoursePhaseParticipation.GetDBModel()
	if err != nil {
		return coursePhaseParticipationDTO.UpdateCoursePhaseParticipation{}, err
	}

	updatedParticipation, err := CoursePhaseParticipationServiceSingleton.queries.UpdateCoursePhaseParticipation(ctx, participation)
	if err != nil {
		return coursePhaseParticipationDTO.UpdateCoursePhaseParticipation{}, err
	}

	return coursePhaseParticipationDTO.UpdateCoursePhaseParticipationDTOFromDBModel(updatedParticipation)
}
