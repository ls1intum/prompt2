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
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion/assessmentCompletionDTO"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentDTO"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/remainingAssessments"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/remainingAssessments/remainingAssessmentsDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
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

	exists, err := qtx.CheckAssessmentCompletionExists(ctx, db.CheckAssessmentCompletionExistsParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
	})
	if err != nil {
		log.Error("could not check assessment completion existence: ", err)
		return errors.New("could not check assessment completion existence")
	}
	if exists {
		log.Error("cannot create assessment, completion already exists")
		return errors.New("assessment was already marked as completed and cannot be modified")
	}

	err = qtx.CreateAssessment(ctx, db.CreateAssessmentParams{
		ID:                    uuid.New(),
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
		CompetencyID:          req.CompetencyID,
		Score:                 req.Score,
		Comment:               pgtype.Text{String: req.Comment, Valid: true},
		AssessedAt:            pgtype.Timestamp{Time: time.Now(), Valid: true},
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

	exists, err := qtx.CheckAssessmentCompletionExists(ctx, db.CheckAssessmentCompletionExistsParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
	})
	if err != nil {
		log.Error("could not check assessment completion existence: ", err)
		return errors.New("could not check assessment completion existence")
	}
	if exists {
		log.Error("cannot update assessment, completion already exists")
		return errors.New("assessment was already marked as completed and cannot be modified")
	}

	err = qtx.UpdateAssessment(ctx, db.UpdateAssessmentParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
		CompetencyID:          req.CompetencyID,
		Score:                 req.Score,
		Comment:               pgtype.Text{String: req.Comment, Valid: true},
		AssessedAt:            pgtype.Timestamp{Time: time.Now(), Valid: true},
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

func GetStudentAssessment(ctx context.Context, coursePhaseID, courseParticipationID uuid.UUID) (assessmentDTO.StudentAssessment, error) {
	assessments, err := ListAssessmentsByStudentInPhase(ctx, courseParticipationID, coursePhaseID)
	if err != nil {
		log.Error("could not get assessments for student in phase: ", err)
		return assessmentDTO.StudentAssessment{}, errors.New("could not get assessments for student in phase")
	}

	remainingAssessments, err := remainingAssessments.CountRemainingAssessmentsForStudent(ctx, courseParticipationID, coursePhaseID)
	if err != nil {
		log.Error("could not count remaining assessments: ", err)
		return assessmentDTO.StudentAssessment{}, errors.New("could not count remaining assessments")
	}

	exists, err := assessmentCompletion.CheckAssessmentCompletionExists(ctx, courseParticipationID, coursePhaseID)
	if err != nil {
		log.Error("could not check assessment completion existence: ", err)
		return assessmentDTO.StudentAssessment{}, errors.New("could not check assessment completion existence")
	}

	var completion assessmentCompletionDTO.AssessmentCompletion = assessmentCompletionDTO.AssessmentCompletion{}
	if exists {
		dbAssessmentCompletion, err := assessmentCompletion.GetAssessmentCompletion(ctx, courseParticipationID, coursePhaseID)
		if err != nil {
			log.Error("could not get assessment completion: ", err)
			return assessmentDTO.StudentAssessment{}, errors.New("could not get assessment completion")
		}
		completion = assessmentCompletionDTO.MapDBAssessmentCompletionToAssessmentCompletionDTO(dbAssessmentCompletion)
	}

	return assessmentDTO.StudentAssessment{
		CourseParticipationID: courseParticipationID,
		Assessments:           assessmentDTO.GetAssessmentDTOsFromDBModels(assessments),
		RemainingAssessments:  remainingAssessmentsDTO.MapToRemainingAssessmentsDTO(remainingAssessments),
		AssessmentCompletion:  completion,
	}, nil
}

func DeleteAssessment(ctx context.Context, id uuid.UUID) error {
	err := AssessmentServiceSingleton.queries.DeleteAssessment(ctx, id)
	if err != nil {
		log.Error("could not delete assessment: ", err)
		return errors.New("could not delete assessment")
	}
	return nil
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
