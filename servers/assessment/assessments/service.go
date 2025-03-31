package assessments

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type AssessmentService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var AssessmentServiceSingleton *AssessmentService

func GetAssessmentsForStudentInPhase(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) ([]assessmentDTO.Assessment, error) {
	assessments, err := AssessmentServiceSingleton.queries.GetAssessmentsForStudentInPhase(ctx, db.GetAssessmentsForStudentInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not fetch assessments: ", err)
		return nil, errors.New("failed to retrieve assessments")
	}
	return assessmentDTO.GetAssessmentDTOsFromDBModels(assessments), nil
}

func CreateAssessment(ctx context.Context, request assessmentDTO.CreateAssessmentRequest) error {
	tx, err := AssessmentServiceSingleton.conn.Begin(ctx)
	if err != nil {
		log.Error("could not begin transaction: ", err)
		return errors.New("failed to start transaction")
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	err = AssessmentServiceSingleton.queries.WithTx(tx).InsertAssessment(ctx, db.InsertAssessmentParams{
		ID:                    uuid.New(),
		CourseParticipationID: request.CourseParticipationID,
		CoursePhaseID:         request.CoursePhaseID,
		CompetencyID:          request.CompetencyID,
		Score:                 request.Score,
		Comment:               pgtype.Text{String: request.Comment, Valid: true},
		AssessedAt:            pgtype.Timestamp{Time: time.Now(), Valid: true},
	})
	if err != nil {
		log.Error("could not insert assessment: ", err)
		return errors.New("failed to insert assessment")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit transaction: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func UpdateAssessment(ctx context.Context, assessmentID uuid.UUID, request assessmentDTO.UpdateAssessmentRequest) error {
	err := AssessmentServiceSingleton.queries.UpdateAssessment(ctx, db.UpdateAssessmentParams{
		ID:         assessmentID,
		Score:      request.Score,
		Comment:    pgtype.Text{String: request.Comment, Valid: true},
		AssessedAt: pgtype.Timestamp{Time: time.Now(), Valid: true},
	})
	if err != nil {
		log.Error("could not update assessment: ", err)
		return errors.New("failed to update assessment")
	}
	return nil
}

func DeleteAssessment(ctx context.Context, assessmentID, courseParticipationID, coursePhaseID uuid.UUID) error {
	err := AssessmentServiceSingleton.queries.DeleteAssessment(ctx, db.DeleteAssessmentParams{
		ID:                    assessmentID,
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not delete assessment: ", err)
		return errors.New("failed to delete assessment")
	}
	return nil
}
