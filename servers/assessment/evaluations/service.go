package evaluations

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessmentType"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/scoreLevel/scoreLevelDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/evaluationCompletion"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/evaluationDTO"
	log "github.com/sirupsen/logrus"
)

type EvaluationService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var EvaluationServiceSingleton *EvaluationService

func CreateOrUpdateEvaluation(ctx context.Context, coursePhaseID uuid.UUID, req evaluationDTO.CreateOrUpdateEvaluationRequest) error {
	tx, err := EvaluationServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := EvaluationServiceSingleton.queries.WithTx(tx)

	err = evaluationCompletion.CheckEvaluationIsEditable(ctx, qtx, req.CourseParticipationID, coursePhaseID, req.AuthorCourseParticipationID, req.Type)
	if err != nil {
		return err
	}

	err = qtx.CreateOrUpdateEvaluation(ctx, db.CreateOrUpdateEvaluationParams{
		CourseParticipationID:       req.CourseParticipationID,
		CoursePhaseID:               coursePhaseID,
		CompetencyID:                req.CompetencyID,
		ScoreLevel:                  scoreLevelDTO.MapDTOtoDBScoreLevel(req.ScoreLevel),
		AuthorCourseParticipationID: req.AuthorCourseParticipationID,
	})
	if err != nil {
		log.Error("could not create or update evaluation: ", err)
		return errors.New("could not create or update evaluation")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func DeleteEvaluation(ctx context.Context, id uuid.UUID) error {
	tx, err := EvaluationServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := EvaluationServiceSingleton.queries.WithTx(tx)

	evaluation, err := qtx.GetEvaluationByID(ctx, id)
	if err != nil {
		log.Error("could not get evaluation by ID: ", err)
		return errors.New("could not get evaluation by ID")
	}

	err = evaluationCompletion.CheckEvaluationIsEditable(ctx, qtx, evaluation.CourseParticipationID, evaluation.CoursePhaseID, evaluation.AuthorCourseParticipationID, assessmentType.MapDBAssessmentTypeToDTO(evaluation.Type))
	if err != nil {
		return err
	}

	err = qtx.DeleteEvaluation(ctx, id)
	if err != nil {
		log.Error("could not delete evaluation: ", err)
		return errors.New("could not delete evaluation")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func GetEvaluationsByPhase(ctx context.Context, coursePhaseID uuid.UUID) ([]evaluationDTO.Evaluation, error) {
	evaluations, err := EvaluationServiceSingleton.queries.GetEvaluationsByPhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get evaluations by phase: ", err)
		return nil, errors.New("could not get evaluations by phase")
	}
	return evaluationDTO.MapToEvaluationDTOs(evaluations), nil
}

func GetSelfEvaluationsByPhase(ctx context.Context, coursePhaseID uuid.UUID) ([]evaluationDTO.Evaluation, error) {
	evaluations, err := EvaluationServiceSingleton.queries.GetSelfEvaluationsByPhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get self evaluations by phase: ", err)
		return nil, errors.New("could not get self evaluations by phase")
	}
	return evaluationDTO.MapToEvaluationDTOs(evaluations), nil
}

func GetSelfEvaluationsForParticipantInPhase(ctx context.Context, courseParticipationID uuid.UUID, coursePhaseID uuid.UUID) ([]evaluationDTO.Evaluation, error) {
	evaluations, err := EvaluationServiceSingleton.queries.GetSelfEvaluationsForParticipantInPhase(ctx, db.GetSelfEvaluationsForParticipantInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not get self evaluations for participant in phase: ", err)
		return nil, errors.New("could not get self evaluations for participant in phase")
	}
	return evaluationDTO.MapToEvaluationDTOs(evaluations), nil
}

func GetPeerEvaluationsByPhase(ctx context.Context, coursePhaseID uuid.UUID) ([]evaluationDTO.Evaluation, error) {
	evaluations, err := EvaluationServiceSingleton.queries.GetPeerEvaluationsByPhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get peer evaluations by phase: ", err)
		return nil, errors.New("could not get peer evaluations by phase")
	}
	return evaluationDTO.MapToEvaluationDTOs(evaluations), nil
}

func GetPeerEvaluationsForParticipantInPhase(ctx context.Context, courseParticipationID uuid.UUID, coursePhaseID uuid.UUID) ([]evaluationDTO.Evaluation, error) {
	evaluations, err := EvaluationServiceSingleton.queries.GetPeerEvaluationsForParticipantInPhase(ctx, db.GetPeerEvaluationsForParticipantInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not get peer evaluations for participant in phase: ", err)
		return nil, errors.New("could not get peer evaluations for participant in phase")
	}
	return evaluationDTO.MapToEvaluationDTOs(evaluations), nil
}

func GetEvaluationsForAuthorInPhase(ctx context.Context, courseParticipationID uuid.UUID, coursePhaseID uuid.UUID) ([]evaluationDTO.Evaluation, error) {
	evaluations, err := EvaluationServiceSingleton.queries.GetEvaluationsForAuthorInPhase(ctx, db.GetEvaluationsForAuthorInPhaseParams{
		AuthorCourseParticipationID: courseParticipationID,
		CoursePhaseID:               coursePhaseID,
	})
	if err != nil {
		log.Error("could not get evaluations for author in phase: ", err)
		return nil, errors.New("could not get evaluations for author in phase")
	}
	return evaluationDTO.MapToEvaluationDTOs(evaluations), nil
}

func GetEvaluationByID(ctx context.Context, id uuid.UUID) (evaluationDTO.Evaluation, error) {
	evaluation, err := EvaluationServiceSingleton.queries.GetEvaluationByID(ctx, id)
	if err != nil {
		log.Error("could not get evaluation by ID: ", err)
		return evaluationDTO.Evaluation{}, errors.New("could not get evaluation by ID")
	}
	return evaluationDTO.MapToEvaluationDTO(evaluation), nil
}
