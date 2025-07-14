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
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/feedbackItem"
	log "github.com/sirupsen/logrus"
)

type AssessmentService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var AssessmentServiceSingleton *AssessmentService

func CreateAssessment(ctx context.Context, req assessmentDTO.CreateOrUpdateAssessmentRequest) error {
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

	err = qtx.CreateAssessment(ctx, db.CreateAssessmentParams{
		ID:                    uuid.New(),
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
		CompetencyID:          req.CompetencyID,
		ScoreLevel:            scoreLevelDTO.MapDTOtoDBScoreLevel(req.ScoreLevel),
		Examples:              req.Examples,
		Comment:               pgtype.Text{String: req.Comment, Valid: true},
		Author:                req.Author,
	})
	if err != nil {
		log.Error("could not create assessment: ", err)
		return errors.New("could not create assessment")
	}
	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit assessment creation: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func UpdateAssessment(ctx context.Context, req assessmentDTO.CreateOrUpdateAssessmentRequest) error {
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

	err = qtx.UpdateAssessment(ctx, db.UpdateAssessmentParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
		CompetencyID:          req.CompetencyID,
		ScoreLevel:            scoreLevelDTO.MapDTOtoDBScoreLevel(req.ScoreLevel),
		Examples:              req.Examples,
		Comment:               pgtype.Text{String: req.Comment, Valid: true},
		Author:                req.Author,
	})
	if err != nil {
		log.Error("could not update assessment: ", err)
		return errors.New("could not update assessment")
	}
	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit assessment update: ", err)
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

func ListAssessmentsByCompetencyInPhase(ctx context.Context, competencyID, coursePhaseID uuid.UUID) ([]db.Assessment, error) {
	assessments, err := AssessmentServiceSingleton.queries.ListAssessmentsByCompetencyInPhase(ctx, db.ListAssessmentsByCompetencyInPhaseParams{
		CompetencyID:  competencyID,
		CoursePhaseID: coursePhaseID,
	})
	if err != nil {
		log.Error("could not get assessments for competency: ", err)
		return nil, errors.New("could not get assessments for competency")
	}
	return assessments, nil
}

func ListAssessmentsByCategoryInPhase(ctx context.Context, categoryID, coursePhaseID uuid.UUID) ([]db.Assessment, error) {
	assessments, err := AssessmentServiceSingleton.queries.ListAssessmentsByCategoryInPhase(ctx, db.ListAssessmentsByCategoryInPhaseParams{
		CategoryID:    categoryID,
		CoursePhaseID: coursePhaseID,
	})
	if err != nil {
		log.Error("could not get assessments for category: ", err)
		return nil, errors.New("could not get assessments for category")
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
	if len(assessments) > 0 {
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

		studentScore, err = scoreLevel.GetStudentScore(ctx, courseParticipationID, coursePhaseID)
		if err != nil {
			log.Error("could not get score level: ", err)
			return assessmentDTO.StudentAssessment{}, errors.New("could not get score level")
		}
	}

	selfEvaluations, err := evaluations.GetSelfEvaluationsForParticipantInPhase(ctx, courseParticipationID, coursePhaseID)
	if err != nil {
		log.Error("could not get self evaluations: ", err)
		return assessmentDTO.StudentAssessment{}, errors.New("could not get self evaluations")
	}

	peerEvaluations, err := evaluations.GetPeerEvaluationsForParticipantInPhase(ctx, courseParticipationID, coursePhaseID)
	if err != nil {
		log.Error("could not get peer evaluations: ", err)
		return assessmentDTO.StudentAssessment{}, errors.New("could not get peer evaluations")
	}

	positiveFeedbackItems, err := feedbackItem.ListPositiveFeedbackItemsForStudentInPhase(ctx, courseParticipationID, coursePhaseID)
	if err != nil {
		log.Error("could not get positive feedback items: ", err)
		return assessmentDTO.StudentAssessment{}, errors.New("could not get positive feedback items")
	}

	negativeFeedbackItems, err := feedbackItem.ListNegativeFeedbackItemsForStudentInPhase(ctx, courseParticipationID, coursePhaseID)
	if err != nil {
		log.Error("could not get negative feedback items: ", err)
		return assessmentDTO.StudentAssessment{}, errors.New("could not get negative feedback items")
	}

	return assessmentDTO.StudentAssessment{
		CourseParticipationID: courseParticipationID,
		Assessments:           assessmentDTO.GetAssessmentDTOsFromDBModels(assessments),
		AssessmentCompletion:  completion,
		StudentScore:          studentScore,
		SelfEvaluations:       selfEvaluations,
		PeerEvaluations:       peerEvaluations,
		PositiveFeedbackItems: positiveFeedbackItems,
		NegativeFeedbackItems: negativeFeedbackItems,
	}, nil
}

func DeleteAssessment(ctx context.Context, id uuid.UUID) error {
	tx, err := AssessmentServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentServiceSingleton.queries.WithTx(tx)

	// Get the assessment details to check if it's editable
	assessment, err := qtx.GetAssessment(ctx, id)
	if err != nil {
		// If assessment doesn't exist, return nil (no error) as it's already "deleted"
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
