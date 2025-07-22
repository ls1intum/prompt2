package evaluationCompletion

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
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/evaluationCompletion/evaluationCompletionDTO"
	log "github.com/sirupsen/logrus"
)

type EvaluationCompletionService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var EvaluationCompletionServiceSingleton *EvaluationCompletionService

func CheckEvaluationIsEditableForType(ctx context.Context, qtx *db.Queries, courseParticipationID, coursePhaseID, authorCourseParticipationID uuid.UUID, evaluationType db.EvaluationType) error {
	switch evaluationType {
	case db.EvaluationTypeSelf:
		open, err := coursePhaseConfig.IsSelfEvaluationOpen(ctx, coursePhaseID)
		if err != nil {
			return err
		}
		if !open {
			return coursePhaseConfig.ErrNotStarted
		}
	case db.EvaluationTypePeer:
		open, err := coursePhaseConfig.IsPeerEvaluationOpen(ctx, coursePhaseID)
		if err != nil {
			return err
		}
		if !open {
			return coursePhaseConfig.ErrNotStarted
		}
	case db.EvaluationTypeTutor:
		open, err := coursePhaseConfig.IsTutorEvaluationOpen(ctx, coursePhaseID)
		if err != nil {
			return err
		}
		if !open {
			return coursePhaseConfig.ErrNotStarted
		}
	}

	exists, err := qtx.CheckEvaluationCompletionExists(ctx, db.CheckEvaluationCompletionExistsParams{
		CourseParticipationID:       courseParticipationID,
		CoursePhaseID:               coursePhaseID,
		AuthorCourseParticipationID: authorCourseParticipationID,
	})
	if err != nil {
		log.Error("could not check evaluation completion existence: ", err)
		return errors.New("could not check evaluation completion existence")
	}
	if exists {
		completion, err := qtx.GetEvaluationCompletion(ctx, db.GetEvaluationCompletionParams{
			CourseParticipationID:       courseParticipationID,
			CoursePhaseID:               coursePhaseID,
			AuthorCourseParticipationID: authorCourseParticipationID,
		})
		if err != nil {
			log.Error("could not get evaluation completion: ", err)
			return errors.New("could not get evaluation completion")
		}

		if completion.Completed {
			log.Error("evaluation completion already exists and is marked as completed")
			return errors.New("evaluation completion already exists and is marked as completed")
		}
	}
	return nil
}

func CheckEvaluationIsEditable(ctx context.Context, qtx *db.Queries, courseParticipationID, coursePhaseID, authorCourseParticipationID uuid.UUID) error {
	// Determine evaluation type based on existing logic
	var evaluationType db.EvaluationType
	if courseParticipationID == authorCourseParticipationID {
		evaluationType = db.EvaluationTypeSelf
	} else {
		// For now, default to peer evaluation for backward compatibility
		// In the future, this should be determined more explicitly
		evaluationType = db.EvaluationTypePeer
	}

	return CheckEvaluationIsEditableForType(ctx, qtx, courseParticipationID, coursePhaseID, authorCourseParticipationID, evaluationType)
}

func CreateOrUpdateEvaluationCompletion(ctx context.Context, req evaluationCompletionDTO.EvaluationCompletion) error {
	err := CheckEvaluationIsEditable(ctx, &EvaluationCompletionServiceSingleton.queries, req.CourseParticipationID, req.CoursePhaseID, req.AuthorCourseParticipationID)
	if err != nil {
		return err
	}

	tx, err := EvaluationCompletionServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := EvaluationCompletionServiceSingleton.queries.WithTx(tx)

	err = qtx.CreateOrUpdateEvaluationCompletion(ctx, db.CreateOrUpdateEvaluationCompletionParams{
		CourseParticipationID:       req.CourseParticipationID,
		CoursePhaseID:               req.CoursePhaseID,
		AuthorCourseParticipationID: req.AuthorCourseParticipationID,
		CompletedAt:                 pgtype.Timestamptz{Time: time.Now(), Valid: true},
		Completed:                   req.Completed,
	})
	if err != nil {
		log.Error("could not create or update evaluation completion: ", err)
		return errors.New("could not create or update evaluation completion")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit evaluation completion: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func CreateOrUpdateTutorEvaluationCompletion(ctx context.Context, req evaluationCompletionDTO.EvaluationCompletion) error {
	err := CheckEvaluationIsEditableForType(ctx, &EvaluationCompletionServiceSingleton.queries, req.CourseParticipationID, req.CoursePhaseID, req.AuthorCourseParticipationID, db.EvaluationTypeTutor)
	if err != nil {
		return err
	}

	tx, err := EvaluationCompletionServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := EvaluationCompletionServiceSingleton.queries.WithTx(tx)

	err = qtx.CreateOrUpdateEvaluationCompletion(ctx, db.CreateOrUpdateEvaluationCompletionParams{
		CourseParticipationID:       req.CourseParticipationID,
		CoursePhaseID:               req.CoursePhaseID,
		AuthorCourseParticipationID: req.AuthorCourseParticipationID,
		CompletedAt:                 pgtype.Timestamptz{Time: time.Now(), Valid: true},
		Completed:                   req.Completed,
	})
	if err != nil {
		log.Error("could not create or update tutor evaluation completion: ", err)
		return errors.New("could not create or update tutor evaluation completion")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit tutor evaluation completion: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func MarkEvaluationAsCompleted(ctx context.Context, req evaluationCompletionDTO.EvaluationCompletion) error {
	err := CheckEvaluationIsEditable(ctx, &EvaluationCompletionServiceSingleton.queries, req.CourseParticipationID, req.CoursePhaseID, req.AuthorCourseParticipationID)
	if err != nil {
		return err
	}

	// Check if there are remaining evaluations before marking as completed
	remainingEvaluations, err := EvaluationCompletionServiceSingleton.queries.CountRemainingEvaluationsForStudent(ctx, db.CountRemainingEvaluationsForStudentParams{
		Column1:       req.CourseParticipationID,
		Column2:       req.AuthorCourseParticipationID,
		CoursePhaseID: req.CoursePhaseID,
	})
	if err != nil {
		log.Error("could not check remaining evaluations: ", err)
		return errors.New("could not check remaining evaluations")
	}

	if remainingEvaluations > 0 {
		log.Warnf("cannot mark evaluation as completed: %d evaluations still remaining", remainingEvaluations)
		return fmt.Errorf("cannot mark evaluation as completed: %d evaluations still remaining", remainingEvaluations)
	}

	tx, err := EvaluationCompletionServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := EvaluationCompletionServiceSingleton.queries.WithTx(tx)

	err = qtx.MarkEvaluationAsFinished(ctx, db.MarkEvaluationAsFinishedParams{
		CourseParticipationID:       req.CourseParticipationID,
		CoursePhaseID:               req.CoursePhaseID,
		AuthorCourseParticipationID: req.AuthorCourseParticipationID,
		CompletedAt:                 pgtype.Timestamptz{Time: time.Now(), Valid: true},
	})
	if err != nil {
		log.Error("could not mark evaluation as finished: ", err)
		return errors.New("could not mark evaluation as finished")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit evaluation completion: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func MarkTutorEvaluationAsCompleted(ctx context.Context, req evaluationCompletionDTO.EvaluationCompletion) error {
	err := CheckEvaluationIsEditableForType(ctx, &EvaluationCompletionServiceSingleton.queries, req.CourseParticipationID, req.CoursePhaseID, req.AuthorCourseParticipationID, db.EvaluationTypeTutor)
	if err != nil {
		return err
	}

	// For tutor evaluations, we might have different logic for checking remaining evaluations
	// For now, we'll use the same logic but this could be tutor-specific in the future
	remainingEvaluations, err := EvaluationCompletionServiceSingleton.queries.CountRemainingEvaluationsForStudent(ctx, db.CountRemainingEvaluationsForStudentParams{
		Column1:       req.CourseParticipationID,
		Column2:       req.AuthorCourseParticipationID,
		CoursePhaseID: req.CoursePhaseID,
	})
	if err != nil {
		log.Error("could not check remaining tutor evaluations: ", err)
		return errors.New("could not check remaining tutor evaluations")
	}

	if remainingEvaluations > 0 {
		log.Warnf("cannot mark tutor evaluation as completed: %d evaluations still remaining", remainingEvaluations)
		return fmt.Errorf("cannot mark tutor evaluation as completed: %d evaluations still remaining", remainingEvaluations)
	}

	tx, err := EvaluationCompletionServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := EvaluationCompletionServiceSingleton.queries.WithTx(tx)

	err = qtx.MarkEvaluationAsFinished(ctx, db.MarkEvaluationAsFinishedParams{
		CourseParticipationID:       req.CourseParticipationID,
		CoursePhaseID:               req.CoursePhaseID,
		AuthorCourseParticipationID: req.AuthorCourseParticipationID,
		CompletedAt:                 pgtype.Timestamptz{Time: time.Now(), Valid: true},
	})
	if err != nil {
		log.Error("could not mark tutor evaluation as finished: ", err)
		return errors.New("could not mark tutor evaluation as finished")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit tutor evaluation completion: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func UnmarkEvaluationAsCompleted(ctx context.Context, courseParticipationID, coursePhaseID, authorCourseParticipationID uuid.UUID) error {
	// Get the evaluation completion to determine its type
	completion, err := EvaluationCompletionServiceSingleton.queries.GetEvaluationCompletion(ctx, db.GetEvaluationCompletionParams{
		CourseParticipationID:       courseParticipationID,
		CoursePhaseID:               coursePhaseID,
		AuthorCourseParticipationID: authorCourseParticipationID,
	})
	if err != nil {
		log.Error("could not get evaluation completion: ", err)
		return errors.New("could not get evaluation completion")
	}

	// Check deadline based on evaluation type
	switch completion.Type {
	case db.EvaluationTypeSelf:
		deadlinePassed, err := coursePhaseConfig.IsSelfEvaluationDeadlinePassed(ctx, coursePhaseID)
		if err != nil {
			return err
		}
		if deadlinePassed {
			return coursePhaseConfig.ErrDeadlinePassed
		}
	case db.EvaluationTypePeer:
		deadlinePassed, err := coursePhaseConfig.IsPeerEvaluationDeadlinePassed(ctx, coursePhaseID)
		if err != nil {
			return err
		}
		if deadlinePassed {
			return coursePhaseConfig.ErrDeadlinePassed
		}
	case db.EvaluationTypeTutor:
		deadlinePassed, err := coursePhaseConfig.IsTutorEvaluationDeadlinePassed(ctx, coursePhaseID)
		if err != nil {
			return err
		}
		if deadlinePassed {
			return coursePhaseConfig.ErrDeadlinePassed
		}
	}

	err = EvaluationCompletionServiceSingleton.queries.UnmarkEvaluationAsFinished(ctx, db.UnmarkEvaluationAsFinishedParams{
		CourseParticipationID:       courseParticipationID,
		CoursePhaseID:               coursePhaseID,
		AuthorCourseParticipationID: authorCourseParticipationID,
	})
	if err != nil {
		log.Error("could not unmark evaluation as finished: ", err)
		return errors.New("could not unmark evaluation as finished")
	}
	return nil
}

func DeleteEvaluationCompletion(ctx context.Context, courseParticipationID, coursePhaseID, authorCourseParticipationID uuid.UUID) error {
	err := EvaluationCompletionServiceSingleton.queries.DeleteEvaluationCompletion(ctx, db.DeleteEvaluationCompletionParams{
		CourseParticipationID:       courseParticipationID,
		CoursePhaseID:               coursePhaseID,
		AuthorCourseParticipationID: authorCourseParticipationID,
	})
	if err != nil {
		log.Error("could not delete evaluation completion: ", err)
		return errors.New("could not delete evaluation completion")
	}
	return nil
}

func ListEvaluationCompletionsByCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]db.EvaluationCompletion, error) {
	completions, err := EvaluationCompletionServiceSingleton.queries.GetEvaluationCompletionsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get evaluation completions by course phase: ", err)
		return nil, errors.New("could not get evaluation completions by course phase")
	}
	return completions, nil
}

func ListSelfEvaluationCompletionsByCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]db.EvaluationCompletion, error) {
	completions, err := EvaluationCompletionServiceSingleton.queries.GetSelfEvaluationCompletionsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get self evaluation completions by course phase: ", err)
		return nil, errors.New("could not get self evaluation completions by course phase")
	}
	return completions, nil
}

func ListPeerEvaluationCompletionsByCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]db.EvaluationCompletion, error) {
	completions, err := EvaluationCompletionServiceSingleton.queries.GetPeerEvaluationCompletionsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get peer evaluation completions by course phase: ", err)
		return nil, errors.New("could not get peer evaluation completions by course phase")
	}
	return completions, nil
}

func ListTutorEvaluationCompletionsByCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]db.EvaluationCompletion, error) {
	completions, err := EvaluationCompletionServiceSingleton.queries.GetTutorEvaluationCompletionsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get tutor evaluation completions by course phase: ", err)
		return nil, errors.New("could not get tutor evaluation completions by course phase")
	}
	return completions, nil
}

func GetEvaluationCompletion(ctx context.Context, courseParticipationID, coursePhaseID, authorCourseParticipationID uuid.UUID) (db.EvaluationCompletion, error) {
	completion, err := EvaluationCompletionServiceSingleton.queries.GetEvaluationCompletion(ctx, db.GetEvaluationCompletionParams{
		CourseParticipationID:       courseParticipationID,
		CoursePhaseID:               coursePhaseID,
		AuthorCourseParticipationID: authorCourseParticipationID,
	})
	if err != nil {
		// Check if it's a "no rows" error, which is expected when no completion exists yet
		if errors.Is(err, pgx.ErrNoRows) {
			// Return empty completion with default values
			return db.EvaluationCompletion{}, nil
		}
		log.Error("could not get evaluation completion: ", err)
		return db.EvaluationCompletion{}, errors.New("could not get evaluation completion")
	}
	return completion, nil
}

func ListPeerEvaluationCompletionsForParticipantInPhase(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) ([]db.EvaluationCompletion, error) {
	completions, err := EvaluationCompletionServiceSingleton.queries.GetPeerEvaluationCompletionsForParticipantInPhase(ctx, db.GetPeerEvaluationCompletionsForParticipantInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not get peer evaluation completions for participant in phase: ", err)
		return nil, errors.New("could not get peer evaluation completions for participant in phase")
	}
	return completions, nil
}

func GetEvaluationCompletionsForAuthorInPhase(ctx context.Context, authorCourseParticipationID, coursePhaseID uuid.UUID) ([]db.EvaluationCompletion, error) {
	completions, err := EvaluationCompletionServiceSingleton.queries.GetPeerEvaluationCompletionsForAuthorInPhase(ctx, db.GetPeerEvaluationCompletionsForAuthorInPhaseParams{
		AuthorCourseParticipationID: authorCourseParticipationID,
		CoursePhaseID:               coursePhaseID,
	})
	if err != nil {
		log.Error("could not get evaluation completions for author in phase: ", err)
		return nil, errors.New("could not get evaluation completions for author in phase")
	}
	return completions, nil
}

func ListTutorEvaluationCompletionsForParticipantInPhase(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) ([]db.EvaluationCompletion, error) {
	completions, err := EvaluationCompletionServiceSingleton.queries.GetTutorEvaluationCompletionsForParticipantInPhase(ctx, db.GetTutorEvaluationCompletionsForParticipantInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not get tutor evaluation completions for participant in phase: ", err)
		return nil, errors.New("could not get tutor evaluation completions for participant in phase")
	}
	return completions, nil
}

func GetTutorEvaluationCompletionsForAuthorInPhase(ctx context.Context, authorCourseParticipationID, coursePhaseID uuid.UUID) ([]db.EvaluationCompletion, error) {
	completions, err := EvaluationCompletionServiceSingleton.queries.GetTutorEvaluationCompletionsForAuthorInPhase(ctx, db.GetTutorEvaluationCompletionsForAuthorInPhaseParams{
		AuthorCourseParticipationID: authorCourseParticipationID,
		CoursePhaseID:               coursePhaseID,
	})
	if err != nil {
		log.Error("could not get tutor evaluation completions for author in phase: ", err)
		return nil, errors.New("could not get tutor evaluation completions for author in phase")
	}
	return completions, nil
}
