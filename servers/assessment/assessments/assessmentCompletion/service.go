package assessmentCompletion

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/actionItem"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion/assessmentCompletionDTO"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

// ErrDeadlinePassed represents an error when trying to perform an action after the deadline has passed
var ErrDeadlinePassed = errors.New("cannot unmark assessment as completed: deadline has passed")

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

func CountRemainingAssessmentsForStudent(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) (db.CountRemainingAssessmentsForStudentRow, error) {
	remainingAssessments, err := AssessmentCompletionServiceSingleton.queries.CountRemainingAssessmentsForStudent(ctx, db.CountRemainingAssessmentsForStudentParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not count remaining assessments: ", err)
		return db.CountRemainingAssessmentsForStudentRow{}, errors.New("could not count remaining assessments")
	}
	return remainingAssessments, nil
}

func CreateOrUpdateAssessmentCompletion(ctx context.Context, req assessmentCompletionDTO.AssessmentCompletion) error {
	tx, err := AssessmentCompletionServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentCompletionServiceSingleton.queries.WithTx(tx)

	err = qtx.CreateOrUpdateAssessmentCompletion(ctx, db.CreateOrUpdateAssessmentCompletionParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
		CompletedAt:           pgtype.Timestamptz{Time: time.Now(), Valid: true},
		Author:                req.Author,
		Comment:               req.Comment,
		GradeSuggestion:       assessmentCompletionDTO.MapFloat64ToNumeric(req.GradeSuggestion),
		Completed:             req.Completed,
	})
	if err != nil {
		log.Error("could not create or update assessment completion: ", err)
		return errors.New("could not create or update assessment completion")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit assessment completion: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func MarkAssessmentAsCompleted(ctx context.Context, req assessmentCompletionDTO.AssessmentCompletion) error {
	remaining, err := CountRemainingAssessmentsForStudent(ctx, req.CourseParticipationID, req.CoursePhaseID)
	if err != nil {
		log.Error("could not count remaining assessments: ", err)
		return errors.New("could not count remaining assessments")
	}
	if remaining.RemainingAssessments > 0 {
		log.Error("cannot mark assessment as completed, remaining assessments exist")
		return errors.New("cannot mark assessment as completed, remaining assessments exist")
	}

	// Check if there are at least 3 action items for this student in this course phase
	actionItemCount, err := actionItem.CountActionItemsForStudentInPhase(ctx, req.CourseParticipationID, req.CoursePhaseID)
	if err != nil {
		log.Error("could not count action items for student in phase: ", err)
		return errors.New("could not count action items for student in phase")
	}
	if actionItemCount < 3 {
		log.Error("cannot mark assessment as completed, at least 3 action items are required")
		return errors.New("cannot mark assessment as completed, at least 3 action items are required")
	}

	tx, err := AssessmentCompletionServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentCompletionServiceSingleton.queries.WithTx(tx)

	err = qtx.MarkAssessmentAsFinished(ctx, db.MarkAssessmentAsFinishedParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
		CompletedAt:           pgtype.Timestamptz{Time: time.Now(), Valid: true},
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
	// Check if deadline has passed
	deadline, err := coursePhaseConfig.GetCoursePhaseDeadline(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get course phase deadline: ", err)
		return errors.New("could not check deadline")
	}

	// If deadline exists and has passed, prevent unmarking
	if deadline != nil && time.Now().After(*deadline) {
		return ErrDeadlinePassed
	}

	err = AssessmentCompletionServiceSingleton.queries.UnmarkAssessmentAsFinished(ctx, db.UnmarkAssessmentAsFinishedParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not unmark assessment as finished: ", err)
		return errors.New("could not unmark assessment as finished")
	}
	return nil
}

func DeleteAssessmentCompletion(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) error {
	err := AssessmentCompletionServiceSingleton.queries.DeleteAssessmentCompletion(ctx, db.DeleteAssessmentCompletionParams{
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
		log.Error("could not get assessment completion: ", err)
		return db.AssessmentCompletion{}, errors.New("could not get assessment completion")
	}
	return completion, nil
}
