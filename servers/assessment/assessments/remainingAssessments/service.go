package remainingAssessments

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type RemainingAssessmentsService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var RemainingAssessmentsServiceSingleton *RemainingAssessmentsService

func CountRemainingAssessmentsForStudent(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) (db.CountRemainingAssessmentsForStudentRow, error) {
	remainingAssessments, err := RemainingAssessmentsServiceSingleton.queries.CountRemainingAssessmentsForStudent(ctx, db.CountRemainingAssessmentsForStudentParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not count remaining assessments: ", err)
		return db.CountRemainingAssessmentsForStudentRow{}, errors.New("could not count remaining assessments")
	}
	return remainingAssessments, nil
}
