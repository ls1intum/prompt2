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

func CreateOrUpdateAssessment(ctx context.Context, req assessmentDTO.CreateOrUpdateAssessmentRequest) (db.Assessment, error) {
	tx, err := AssessmentServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return db.Assessment{}, err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)
	qtx := AssessmentServiceSingleton.queries.WithTx(tx)

	assessedAt := time.Now()
	if req.AssessedAt != nil {
		assessedAt = *req.AssessedAt
	}

	assessment, err := qtx.UpdateAssessment(ctx, db.UpdateAssessmentParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
		CompetencyID:          req.CompetencyID,
		Score:                 req.Score,
		Comment:               pgtype.Text{String: req.Comment, Valid: true},
		AssessedAt:            pgtype.Timestamp{Time: assessedAt, Valid: true},
	})
	if err == nil {
		if err := tx.Commit(ctx); err != nil {
			return db.Assessment{}, fmt.Errorf("failed to commit update: %w", err)
		}
		return assessment, nil
	}

	assessment, err = qtx.CreateAssessment(ctx, db.CreateAssessmentParams{
		ID:                    uuid.New(),
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
		CompetencyID:          req.CompetencyID,
		Score:                 req.Score,
		Comment:               pgtype.Text{String: req.Comment, Valid: true},
		AssessedAt:            pgtype.Timestamp{Time: assessedAt, Valid: true},
	})
	if err != nil {
		log.Error("could not create assessment: ", err)
		return db.Assessment{}, errors.New("could not create assessment")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit assessment creation: ", err)
		return db.Assessment{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return assessment, nil
}

func GetAssessment(ctx context.Context, id uuid.UUID) (db.Assessment, error) {
	assessment, err := AssessmentServiceSingleton.queries.GetAssessment(ctx, id)
	if err != nil {
		log.Error("could not get assessment: ", err)
		return db.Assessment{}, errors.New("could not get assessment")
	}
	return assessment, nil
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

func ListAssessmentsByStudent(ctx context.Context, courseParticipationID uuid.UUID) ([]db.Assessment, error) {
	assessments, err := AssessmentServiceSingleton.queries.ListAssessmentsByStudent(ctx, courseParticipationID)
	if err != nil {
		log.Error("could not get assessments by student: ", err)
		return nil, errors.New("could not get assessments by student")
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

func ListAssessmentsByCompetency(ctx context.Context, competencyID uuid.UUID) ([]db.Assessment, error) {
	assessments, err := AssessmentServiceSingleton.queries.ListAssessmentsByCompetency(ctx, competencyID)
	if err != nil {
		log.Error("could not get assessments for competency: ", err)
		return nil, errors.New("could not get assessments for competency")
	}
	return assessments, nil
}

func ListAssessmentsByCategory(ctx context.Context, categoryID uuid.UUID) ([]db.Assessment, error) {
	assessments, err := AssessmentServiceSingleton.queries.ListAssessmentsByCategory(ctx, categoryID)
	if err != nil {
		log.Error("could not get assessments for category: ", err)
		return nil, errors.New("could not get assessments for category")
	}
	return assessments, nil
}
