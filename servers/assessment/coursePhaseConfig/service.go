package coursePhaseConfig

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig/coursePhaseConfigDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

var ErrNotStarted = errors.New("assessment has not started yet")
var ErrDeadlinePassed = errors.New("deadline has passed")

type CoursePhaseConfigService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CoursePhaseConfigSingleton *CoursePhaseConfigService

func NewCoursePhaseConfigService(queries db.Queries, conn *pgxpool.Pool) *CoursePhaseConfigService {
	return &CoursePhaseConfigService{
		queries: queries,
		conn:    conn,
	}
}

func GetCoursePhaseConfig(ctx context.Context, coursePhaseID uuid.UUID) (db.CoursePhaseConfig, error) {
	config, err := CoursePhaseConfigSingleton.queries.GetCoursePhaseConfig(ctx, coursePhaseID)
	if err != nil && errors.Is(err, sql.ErrNoRows) {
		tx, err := CoursePhaseConfigSingleton.conn.Begin(ctx)
		if err != nil {
			return db.CoursePhaseConfig{}, err
		}
		defer promptSDK.DeferDBRollback(tx, ctx)

		qtx := CoursePhaseConfigSingleton.queries.WithTx(tx)

		err = qtx.CreateDefaultCoursePhaseConfig(ctx, coursePhaseID)
		if err != nil {
			log.WithError(err).Error("Failed to create or update course phase config")
			return db.CoursePhaseConfig{}, err
		}

		err = tx.Commit(ctx)
		if err != nil {
			log.WithError(err).Error("Failed to commit transaction for course phase config creation")
			return db.CoursePhaseConfig{}, err
		}
	} else if err != nil {
		log.Error("could not get course phase config: ", err)
		return db.CoursePhaseConfig{}, errors.New("could not get course phase config")
	}

	return config, nil
}

func CreateOrUpdateCoursePhaseConfig(ctx context.Context, coursePhaseID uuid.UUID, req coursePhaseConfigDTO.CreateOrUpdateCoursePhaseConfigRequest) error {
	tx, err := CoursePhaseConfigSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := CoursePhaseConfigSingleton.queries.WithTx(tx)

	params := db.CreateOrUpdateCoursePhaseConfigParams{
		AssessmentTemplateID:     req.AssessmentTemplateID,
		CoursePhaseID:            coursePhaseID,
		Start:                    pgtype.Timestamptz{Time: req.Start, Valid: !req.Start.IsZero()},
		Deadline:                 pgtype.Timestamptz{Time: req.Deadline, Valid: !req.Deadline.IsZero()},
		SelfEvaluationEnabled:    req.SelfEvaluationEnabled,
		SelfEvaluationTemplate:   req.SelfEvaluationTemplate,
		SelfEvaluationStart:      pgtype.Timestamptz{Time: req.SelfEvaluationStart, Valid: !req.SelfEvaluationStart.IsZero()},
		SelfEvaluationDeadline:   pgtype.Timestamptz{Time: req.SelfEvaluationDeadline, Valid: !req.SelfEvaluationDeadline.IsZero()},
		PeerEvaluationEnabled:    req.PeerEvaluationEnabled,
		PeerEvaluationTemplate:   req.PeerEvaluationTemplate,
		PeerEvaluationStart:      pgtype.Timestamptz{Time: req.PeerEvaluationStart, Valid: !req.PeerEvaluationStart.IsZero()},
		PeerEvaluationDeadline:   pgtype.Timestamptz{Time: req.PeerEvaluationDeadline, Valid: !req.PeerEvaluationDeadline.IsZero()},
		TutorEvaluationEnabled:   req.TutorEvaluationEnabled,
		TutorEvaluationTemplate:  req.TutorEvaluationTemplate,
		TutorEvaluationStart:     pgtype.Timestamptz{Time: req.TutorEvaluationStart, Valid: !req.TutorEvaluationStart.IsZero()},
		TutorEvaluationDeadline:  pgtype.Timestamptz{Time: req.TutorEvaluationDeadline, Valid: !req.TutorEvaluationDeadline.IsZero()},
		EvaluationResultsVisible: req.EvaluationResultsVisible,
		GradeSuggestionVisible:   req.GradeSuggestionVisible,
		ActionItemsVisible:       req.ActionItemsVisible,
	}

	err = qtx.CreateOrUpdateCoursePhaseConfig(ctx, params)
	if err != nil {
		log.WithError(err).Error("Failed to create or update course phase config")
		return err
	}

	return tx.Commit(ctx)
}

func IsAssessmentOpen(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	open, err := CoursePhaseConfigSingleton.queries.IsAssessmentOpen(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not check if assessment is open: ", err)
		return false, errors.New("could not check if assessment is open")
	}
	return open, nil
}

func IsAssessmentDeadlinePassed(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	deadlinePassed, err := CoursePhaseConfigSingleton.queries.IsAssessmentDeadlinePassed(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not check if assessment deadline has passed: ", err)
		return false, errors.New("could not check if assessment deadline has passed")
	}
	return deadlinePassed, nil
}

func IsSelfEvaluationOpen(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	open, err := CoursePhaseConfigSingleton.queries.IsSelfEvaluationOpen(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not check if self evaluation is open: ", err)
		return false, errors.New("could not check if self evaluation is open")
	}
	return open, nil
}

func IsSelfEvaluationDeadlinePassed(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	deadlinePassed, err := CoursePhaseConfigSingleton.queries.IsSelfEvaluationDeadlinePassed(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not check if self evaluation deadline has passed: ", err)
		return false, errors.New("could not check if self evaluation deadline has passed")
	}
	return deadlinePassed, nil
}

func IsPeerEvaluationOpen(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	open, err := CoursePhaseConfigSingleton.queries.IsPeerEvaluationOpen(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not check if peer evaluation is open: ", err)
		return false, errors.New("could not check if peer evaluation is open")
	}
	return open, nil
}

func IsPeerEvaluationDeadlinePassed(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	deadlinePassed, err := CoursePhaseConfigSingleton.queries.IsPeerEvaluationDeadlinePassed(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not check if peer evaluation deadline has passed: ", err)
		return false, errors.New("could not check if peer evaluation deadline has passed")
	}
	return deadlinePassed, nil
}

func IsTutorEvaluationOpen(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	open, err := CoursePhaseConfigSingleton.queries.IsTutorEvaluationOpen(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not check if tutor evaluation is open: ", err)
		return false, errors.New("could not check if tutor evaluation is open")
	}
	return open, nil
}

func IsTutorEvaluationDeadlinePassed(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	deadlinePassed, err := CoursePhaseConfigSingleton.queries.IsTutorEvaluationDeadlinePassed(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not check if tutor evaluation deadline has passed: ", err)
		return false, errors.New("could not check if tutor evaluation deadline has passed")
	}
	return deadlinePassed, nil
}
