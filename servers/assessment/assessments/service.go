package assessments

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion/assessmentCompletionDTO"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentDTO"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/scoreLevel"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/scoreLevel/scoreLevelDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/evaluationDTO"
	log "github.com/sirupsen/logrus"
)

type AssessmentService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var AssessmentServiceSingleton *AssessmentService

func CreateOrUpdateAssessment(ctx context.Context, req assessmentDTO.CreateOrUpdateAssessmentRequest) error {
	tx, err := AssessmentServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentServiceSingleton.queries.WithTx(tx)

	err = assessmentCompletion.CheckAssessmentIsEditable(ctx, qtx, req.CourseParticipationID, req.CoursePhaseID)
	if err != nil {
		return err
	}

	err = qtx.CreateOrUpdateAssessment(ctx, db.CreateOrUpdateAssessmentParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
		CompetencyID:          req.CompetencyID,
		ScoreLevel:            scoreLevelDTO.MapDTOtoDBScoreLevel(req.ScoreLevel),
		Examples:              req.Examples,
		Comment:               pgtype.Text{String: req.Comment, Valid: true},
		Author:                req.Author,
	})
	if err != nil {
		log.Error("could not create or update assessment: ", err)
		return errors.New("could not create or update assessment")
	}
	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit assessment creation/update: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func GetAssessment(ctx context.Context, id uuid.UUID) (db.Assessment, error) {
	assessment, err := AssessmentServiceSingleton.queries.GetAssessment(ctx, id)
	if err != nil {
		log.Error("could not get assessment: ", err)
		return db.Assessment{}, errors.New("could not get assessment")
	}
	return assessment, nil
}

func ListAssessmentsByCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]db.Assessment, error) {
	assessments, err := AssessmentServiceSingleton.queries.ListAssessmentsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get assessments by course phase: ", err)
		return nil, errors.New("could not get assessments by course phase")
	}
	return assessments, nil
}

func ListAssessmentsByStudentInPhase(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) ([]db.Assessment, error) {
	assessments, err := AssessmentServiceSingleton.queries.ListAssessmentsByStudentInPhase(ctx, db.ListAssessmentsByStudentInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not get assessments for student in phase: ", err)
		return nil, errors.New("could not get assessments for student in phase")
	}
	return assessments, nil
}

func GetStudentAssessment(ctx context.Context, coursePhaseID, courseParticipationID uuid.UUID) (assessmentDTO.StudentAssessment, error) {
	assessments, err := ListAssessmentsByStudentInPhase(ctx, courseParticipationID, coursePhaseID)
	if err != nil {
		log.Error("could not get assessments for student in phase: ", err)
		return assessmentDTO.StudentAssessment{}, errors.New("could not get assessments for student in phase")
	}

	var completion assessmentCompletionDTO.AssessmentCompletion = assessmentCompletionDTO.AssessmentCompletion{}
	var studentScore = scoreLevelDTO.StudentScore{
		ScoreLevel:   scoreLevelDTO.ScoreLevelVeryBad,
		ScoreNumeric: pgtype.Float8{Float64: 0.0, Valid: true},
	}

	exists, err := assessmentCompletion.CheckAssessmentCompletionExists(ctx, courseParticipationID, coursePhaseID)
	if err != nil {
		log.Error("could not check assessment completion existence: ", err)
		return assessmentDTO.StudentAssessment{}, errors.New("could not check assessment completion existence")
	}

	if exists {
		dbAssessmentCompletion, err := assessmentCompletion.GetAssessmentCompletion(ctx, courseParticipationID, coursePhaseID)
		if err != nil {
			log.Error("could not get assessment completion: ", err)
			return assessmentDTO.StudentAssessment{}, errors.New("could not get assessment completion")
		}
		completion = assessmentCompletionDTO.MapDBAssessmentCompletionToAssessmentCompletionDTO(dbAssessmentCompletion)
	}

	if len(assessments) > 0 {
		studentScore, err = scoreLevel.GetStudentScore(ctx, courseParticipationID, coursePhaseID)
		if err != nil {
			log.Error("could not get score level: ", err)
			return assessmentDTO.StudentAssessment{}, errors.New("could not get score level")
		}
	}

	evaluations, err := evaluations.GetEvaluationsForParticipantInPhase(ctx, courseParticipationID, coursePhaseID)
	if err != nil {
		log.Error("could not get evaluations: ", err)
		return assessmentDTO.StudentAssessment{}, errors.New("could not get evaluations")
	}

	if evaluations == nil {
		evaluations = []evaluationDTO.Evaluation{}
	}

	return assessmentDTO.StudentAssessment{
		CourseParticipationID: courseParticipationID,
		Assessments:           assessmentDTO.GetAssessmentDTOsFromDBModels(assessments),
		AssessmentCompletion:  completion,
		StudentScore:          studentScore,
		Evaluations:           evaluations,
	}, nil
}

func DeleteAssessment(ctx context.Context, id uuid.UUID) error {
	tx, err := AssessmentServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentServiceSingleton.queries.WithTx(tx)

	assessment, err := qtx.GetAssessment(ctx, id)
	if err != nil {
		log.Info("assessment not found, nothing to delete: ", err)
		return nil
	}

	// Check if the assessment is editable before deleting
	err = assessmentCompletion.CheckAssessmentIsEditable(ctx, qtx, assessment.CourseParticipationID, assessment.CoursePhaseID)
	if err != nil {
		return err
	}

	err = qtx.DeleteAssessment(ctx, id)
	if err != nil {
		log.Error("could not delete assessment: ", err)
		return errors.New("could not delete assessment")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit assessment deletion: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
