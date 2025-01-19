package coursePhaseParticipation

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/utils"
	log "github.com/sirupsen/logrus"
)

type CoursePhaseParticipationService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CoursePhaseParticipationServiceSingleton *CoursePhaseParticipationService

func GetAllParticipationsForCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]coursePhaseParticipationDTO.GetAllCPPsForCoursePhase, error) {
	coursePhaseParticipations, err := CoursePhaseParticipationServiceSingleton.queries.GetAllCoursePhaseParticipationsForCoursePhaseIncludingPrevious(ctx, coursePhaseID)
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

func CreateCoursePhaseParticipation(ctx context.Context, transactionQueries *db.Queries, newCoursePhaseParticipation coursePhaseParticipationDTO.CreateCoursePhaseParticipation) (coursePhaseParticipationDTO.GetCoursePhaseParticipation, error) {
	queries := utils.GetQueries(transactionQueries, &CoursePhaseParticipationServiceSingleton.queries)
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

	createdParticipation, err := queries.CreateCoursePhaseParticipation(ctx, participation)
	if err != nil {
		return coursePhaseParticipationDTO.GetCoursePhaseParticipation{}, err
	}
	if createdParticipation.ID == uuid.Nil {
		return coursePhaseParticipationDTO.GetCoursePhaseParticipation{}, errors.New("failed to create course phase participation due to mismatch in CourseParticipationID and CoursePhaseID")
	}

	return coursePhaseParticipationDTO.GetCoursePhaseParticipationDTOFromDBModel(createdParticipation)
}

func UpdateCoursePhaseParticipation(ctx context.Context, transactionQueries *db.Queries, updatedCoursePhaseParticipation coursePhaseParticipationDTO.UpdateCoursePhaseParticipation) error {
	queries := utils.GetQueries(transactionQueries, &CoursePhaseParticipationServiceSingleton.queries)
	participation, err := updatedCoursePhaseParticipation.GetDBModel()
	if err != nil {
		log.Error(err)
		return errors.New("failed to create DB model from DTO")
	}

	err = queries.UpdateCoursePhaseParticipation(ctx, participation)
	if err != nil {
		log.Error(err)
		return errors.New("failed to update course phase participation")
	}

	return nil
}

func CreateIfNotExistingPhaseParticipation(ctx context.Context, transactionQueries *db.Queries, CourseParticipationID uuid.UUID, coursePhaseID uuid.UUID) (coursePhaseParticipationDTO.GetCoursePhaseParticipation, error) {
	queries := utils.GetQueries(transactionQueries, &CoursePhaseParticipationServiceSingleton.queries)
	participation, err := queries.GetCoursePhaseParticipationByCourseParticipationAndCoursePhase(ctx, db.GetCoursePhaseParticipationByCourseParticipationAndCoursePhaseParams{
		CourseParticipationID: CourseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err == nil {
		return coursePhaseParticipationDTO.GetCoursePhaseParticipationDTOFromDBModel(participation)
	} else if errors.Is(err, sql.ErrNoRows) {
		// has to be created
		return CreateCoursePhaseParticipation(ctx, &queries, coursePhaseParticipationDTO.CreateCoursePhaseParticipation{
			CourseParticipationID: CourseParticipationID,
			CoursePhaseID:         coursePhaseID,
		})

	} else {
		return coursePhaseParticipationDTO.GetCoursePhaseParticipation{}, err
	}
}

func BatchUpdatePassStatus(ctx context.Context, coursePhaseID uuid.UUID, coursePhaseParticipationIDs []uuid.UUID, passStatus db.PassStatus) ([]uuid.UUID, error) {
	// passing the coursePhaseID to query ensures that only the coursePhases that are in the course are updated
	changedParticipations, err := CoursePhaseParticipationServiceSingleton.queries.UpdateCoursePhasePassStatus(ctx, db.UpdateCoursePhasePassStatusParams{
		Column1: coursePhaseParticipationIDs,
		Column2: coursePhaseID,
		Column3: passStatus,
	})
	if err != nil {
		log.Error(err)
		return nil, errors.New("failed to update pass status")
	}

	return changedParticipations, nil
}
