package coursePhaseParticipation

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CoursePhaseParticipationService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CoursePhaseParticipationServiceSingleton *CoursePhaseParticipationService

func GetAllParticipationsForCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]coursePhaseParticipationDTO.GetAllCPPsForCoursePhase, error) {
	coursePhaseParticipations, err := CoursePhaseParticipationServiceSingleton.queries.GetAllCoursePhaseParticipationsForCoursePhase(ctx, coursePhaseID)
	if err != nil {
		return nil, err
	}

	participationDTOs := make([]coursePhaseParticipationDTO.GetAllCPPsForCoursePhase, 0, len(coursePhaseParticipations))
	for _, coursePhaseParticipation := range coursePhaseParticipations {
		dto, err := coursePhaseParticipationDTO.GetAllCPPsForCoursePhaseDTOFromDBModel(coursePhaseParticipation)
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

func CreateIfNotExistingPhaseParticipation(ctx context.Context, CourseParticipationID uuid.UUID, coursePhaseID uuid.UUID) (coursePhaseParticipationDTO.GetCoursePhaseParticipation, error) {
	participation, err := CoursePhaseParticipationServiceSingleton.queries.GetCoursePhaseParticipationByCourseParticipationAndCoursePhase(ctx, db.GetCoursePhaseParticipationByCourseParticipationAndCoursePhaseParams{
		CourseParticipationID: CourseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err == nil {
		return coursePhaseParticipationDTO.GetCoursePhaseParticipationDTOFromDBModel(participation)
	} else if errors.Is(err, sql.ErrNoRows) {
		// has to be created
		return CreateCoursePhaseParticipation(ctx, coursePhaseParticipationDTO.CreateCoursePhaseParticipation{
			CourseParticipationID: CourseParticipationID,
			CoursePhaseID:         coursePhaseID,
		})

	} else {
		return coursePhaseParticipationDTO.GetCoursePhaseParticipation{}, err
	}
}
