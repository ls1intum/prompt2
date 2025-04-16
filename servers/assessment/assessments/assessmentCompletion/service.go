package assessmentCompletion

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion/assessmentCompletionDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type AssessmentCompletionService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var AssessmentCompletionServiceSingleton *AssessmentCompletionService

func CheckAssessmentCompletionExists(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) (bool, error) {
	exists, err := AssessmentCompletionServiceSingleton.queries.CheckAssessmentCompletionExists(ctx, db.CheckAssessmentCompletionExistsParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not check assessment completion existence: ", err)
		return false, errors.New("could not check assessment completion existence")
	}
	return exists, nil
}

func MarkAssessmentAsCompleted(ctx context.Context, req assessmentCompletionDTO.AssessmentCompletion) error {
	tx, err := AssessmentCompletionServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentCompletionServiceSingleton.queries.WithTx(tx)

	err = qtx.MarkAssessmentAsFinished(ctx, db.MarkAssessmentAsFinishedParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
		CompletedAt:           pgtype.Timestamp{Time: time.Now(), Valid: true},
		Author:                req.Author,
	})
	if err != nil {
		log.Error("could not create assessment completion: ", err)
		return errors.New("could not create assessment completion")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit assessment completion: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func UnmarkAssessmentAsCompleted(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) error {
	err := AssessmentCompletionServiceSingleton.queries.UnmarkAssessmentAsFinished(ctx, db.UnmarkAssessmentAsFinishedParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not delete assessment completion: ", err)
		return errors.New("could not delete assessment completion")
	}
	return nil
}

func ListAssessmentCompletionsByCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]db.AssessmentCompletion, error) {
	completions, err := AssessmentCompletionServiceSingleton.queries.GetAssessmentCompletionsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get completions by course phase: ", err)
		return nil, errors.New("could not get completions by course phase")
	}
	return completions, nil
}

func GetAssessmentCompletion(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) (db.AssessmentCompletion, error) {
	completion, err := AssessmentCompletionServiceSingleton.queries.GetAssessmentCompletion(ctx, db.GetAssessmentCompletionParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return db.AssessmentCompletion{}, nil
		}
		log.Error("could not get assessment completion: ", err)
		return db.AssessmentCompletion{}, errors.New("could not get assessment completion")
	}
	return completion, nil
}
