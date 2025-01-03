package coursePhaseParticipation

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	log "github.com/sirupsen/logrus"
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

func GetCoursePhaseParticipation(ctx context.Context, id uuid.UUID) (coursePhaseParticipationDTO.GetCoursePhaseParticipation, error) {
	coursePhaseParticipation, err := CoursePhaseParticipationServiceSingleton.queries.GetCoursePhaseParticipation(ctx, id)
	if err != nil {
		log.Error(err)
		return coursePhaseParticipationDTO.GetCoursePhaseParticipation{}, errors.New("failed to get course phase participation")
	}

	participationDTO, err := coursePhaseParticipationDTO.GetCoursePhaseParticipationDTOFromDBModel(coursePhaseParticipation)
	if err != nil {
		log.Error(err)
		return coursePhaseParticipationDTO.GetCoursePhaseParticipation{}, errors.New("failed to create DTO from DB model")
	}

	return participationDTO, nil
}

func CreateCoursePhaseParticipation(ctx context.Context, newCoursePhaseParticipation coursePhaseParticipationDTO.CreateCoursePhaseParticipation) (coursePhaseParticipationDTO.GetCoursePhaseParticipation, error) {
	participation, err := newCoursePhaseParticipation.GetDBModel()
	if err != nil {
		return coursePhaseParticipationDTO.GetCoursePhaseParticipation{}, err
	}

	participation.ID = uuid.New()

	if !participation.PassStatus.Valid {
		participation.PassStatus = db.NullPassStatus{
			Valid:      true,
			PassStatus: "not_assessed",
		}
	}

	createdParticipation, err := CoursePhaseParticipationServiceSingleton.queries.CreateCoursePhaseParticipation(ctx, participation)
	if err != nil {
		return coursePhaseParticipationDTO.GetCoursePhaseParticipation{}, err
	}

	return coursePhaseParticipationDTO.GetCoursePhaseParticipationDTOFromDBModel(createdParticipation)
}

func UpdateCoursePhaseParticipation(ctx context.Context, updatedCoursePhaseParticipation coursePhaseParticipationDTO.UpdateCoursePhaseParticipation) error {
	participation, err := updatedCoursePhaseParticipation.GetDBModel()
	if err != nil {
		log.Error(err)
		return errors.New("failed to create DB model from DTO")
	}

	err = CoursePhaseParticipationServiceSingleton.queries.UpdateCoursePhaseParticipation(ctx, participation)
	if err != nil {
		log.Error(err)
		return errors.New("failed to update course phase participation")
	}

	return nil
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
