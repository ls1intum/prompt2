package coursePhaseConfig

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig/coursePhaseConfigDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/assessment/utils"
	log "github.com/sirupsen/logrus"
)

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

func GetCoursePhaseConfig(ctx context.Context, coursePhaseID uuid.UUID) (*db.CoursePhaseConfig, error) {
	config, err := CoursePhaseConfigSingleton.queries.GetCoursePhaseConfig(ctx, coursePhaseID)
	if err != nil && errors.Is(err, sql.ErrNoRows) {
		// No config found for this course phase, return nil
		return nil, nil
	} else if err != nil {
		log.Error("could not get course phase config: ", err)
		return nil, errors.New("could not get course phase config")
	}

	return &config, nil
}

func GetCoursePhaseDeadline(ctx context.Context, coursePhaseID uuid.UUID) (*time.Time, error) {
	deadline, err := CoursePhaseConfigSingleton.queries.GetCoursePhaseDeadline(ctx, coursePhaseID)
	if err != nil && errors.Is(err, sql.ErrNoRows) {
		// No deadline found for this course phase, return nil
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	var response *time.Time
	if deadline.Valid {
		response = &deadline.Time
	}

	return response, nil
}

func UpdateCoursePhaseDeadline(ctx context.Context, coursePhaseID uuid.UUID, deadline time.Time) error {
	params := db.UpdateCoursePhaseDeadlineParams{
		Deadline: pgtype.Timestamptz{
			Time:  deadline,
			Valid: true,
		},
		CoursePhaseID: coursePhaseID,
	}

	return CoursePhaseConfigSingleton.queries.UpdateCoursePhaseDeadline(ctx, params)
}

func GetSelfAssessmentDeadline(ctx context.Context, coursePhaseID uuid.UUID) (*time.Time, error) {
	deadline, err := CoursePhaseConfigSingleton.queries.GetSelfAssessmentDeadline(ctx, coursePhaseID)
	if err != nil && errors.Is(err, sql.ErrNoRows) {
		// No deadline found for this course phase, return nil
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	var response *time.Time
	if deadline.Valid {
		response = &deadline.Time
	}

	return response, nil
}

func UpdateSelfAssessmentDeadline(ctx context.Context, coursePhaseID uuid.UUID, deadline time.Time) error {
	params := db.UpdateSelfAssessmentDeadlineParams{
		SelfAssessmentDeadline: pgtype.Timestamptz{
			Time:  deadline,
			Valid: true,
		},
		CoursePhaseID: coursePhaseID,
	}

	return CoursePhaseConfigSingleton.queries.UpdateSelfAssessmentDeadline(ctx, params)
}

func GetPeerAssessmentDeadline(ctx context.Context, coursePhaseID uuid.UUID) (*time.Time, error) {
	deadline, err := CoursePhaseConfigSingleton.queries.GetPeerAssessmentDeadline(ctx, coursePhaseID)
	if err != nil && errors.Is(err, sql.ErrNoRows) {
		// No deadline found for this course phase, return nil
		return nil, nil
	} else if err != nil {
		return nil, err
	}

	var response *time.Time
	if deadline.Valid {
		response = &deadline.Time
	}

	return response, nil
}

func UpdatePeerAssessmentDeadline(ctx context.Context, coursePhaseID uuid.UUID, deadline time.Time) error {
	params := db.UpdatePeerAssessmentDeadlineParams{
		PeerAssessmentDeadline: pgtype.Timestamptz{
			Time:  deadline,
			Valid: true,
		},
		CoursePhaseID: coursePhaseID,
	}

	return CoursePhaseConfigSingleton.queries.UpdatePeerAssessmentDeadline(ctx, params)
}

func CreateOrUpdateAssessmentTemplateCoursePhase(ctx context.Context, coursePhaseID uuid.UUID, req coursePhaseConfigDTO.CreateOrUpdateAssessmentTemplateRequest) error {
	tx, err := CoursePhaseConfigSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := CoursePhaseConfigSingleton.queries.WithTx(tx)

	err = qtx.CreateOrUpdateAssessmentTemplateCoursePhase(ctx, db.CreateOrUpdateAssessmentTemplateCoursePhaseParams{
		AssessmentTemplateID: req.AssessmentTemplateID,
		CoursePhaseID:        coursePhaseID,
	})
	if err != nil {
		log.WithError(err).Error("Failed to create or update assessment template course phase")
		return err
	}

	return tx.Commit(ctx)
}

func CreateOrUpdateSelfAssessmentTemplateCoursePhase(ctx context.Context, coursePhaseID uuid.UUID, req coursePhaseConfigDTO.CreateOrUpdateAssessmentTemplateRequest) error {
	tx, err := CoursePhaseConfigSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := CoursePhaseConfigSingleton.queries.WithTx(tx)

	err = qtx.CreateOrUpdateSelfAssessmentTemplateCoursePhase(ctx, db.CreateOrUpdateSelfAssessmentTemplateCoursePhaseParams{
		SelfAssessmentTemplate: req.AssessmentTemplateID,
		CoursePhaseID:          coursePhaseID,
	})
	if err != nil {
		log.WithError(err).Error("Failed to create or update self assessment template course phase")
		return err
	}

	return tx.Commit(ctx)
}

func CreateOrUpdatePeerAssessmentTemplateCoursePhase(ctx context.Context, coursePhaseID uuid.UUID, req coursePhaseConfigDTO.CreateOrUpdateAssessmentTemplateRequest) error {
	tx, err := CoursePhaseConfigSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := CoursePhaseConfigSingleton.queries.WithTx(tx)

	err = qtx.CreateOrUpdatePeerAssessmentTemplateCoursePhase(ctx, db.CreateOrUpdatePeerAssessmentTemplateCoursePhaseParams{
		PeerAssessmentTemplate: req.AssessmentTemplateID,
		CoursePhaseID:          coursePhaseID,
	})
	if err != nil {
		log.WithError(err).Error("Failed to create or update peer assessment template course phase")
		return err
	}

	return tx.Commit(ctx)
}

func GetParticipationsForCoursePhase(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]coursePhaseConfigDTO.AssessmentParticipationWithStudent, error) {
	coreURL := utils.GetCoreUrl()
	participations, err := promptSDK.FetchAndMergeParticipationsWithResolutions(coreURL, authHeader, coursePhaseID)
	if err != nil {
		log.Error("could not fetch course phase participations with students: ", err)
		return nil, errors.New("could not fetch course phase participations with students")
	}

	return coursePhaseConfigDTO.GetAssessmentStudentsFromParticipations(participations), nil
}

func GetTeamsForCoursePhase(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]coursePhaseConfigDTO.Team, error) {
	coreURL := utils.GetCoreUrl()
	cpWithResoultion, err := promptSDK.FetchAndMergeCoursePhaseWithResolution(coreURL, authHeader, coursePhaseID)
	if err != nil {
		log.Error("could not fetch course phase with resolution: ", err)
		return nil, errors.New("could not fetch course phase with resolution")
	}
	log.Infof("Fetched course phase with resolution: %+v", cpWithResoultion)

	teams := make([]coursePhaseConfigDTO.Team, 0)
	teamsRaw, teamsExists := cpWithResoultion["teams"]
	if !teamsExists {
		log.Warn("No 'teams' field found in course phase resolution")
		return teams, nil
	}

	teamsSlice, isSlice := teamsRaw.([]interface{})
	if !isSlice {
		log.Error("'teams' field is not a slice")
		return nil, errors.New("invalid teams data structure")
	}

	for i, teamData := range teamsSlice {
		teamMap, isMap := teamData.(map[string]interface{})
		if !isMap {
			log.Warnf("Skipping team at index %d: not a valid map", i)
			continue
		}

		teamIDRaw, idExists := teamMap["id"]
		if !idExists {
			log.Warnf("Skipping team at index %d: missing 'id' field", i)
			continue
		}
		teamIDStr, isString := teamIDRaw.(string)
		if !isString {
			log.Warnf("Skipping team at index %d: 'id' field is not a string", i)
			continue
		}
		teamID, err := uuid.Parse(teamIDStr)
		if err != nil {
			log.Warnf("Skipping team at index %d: invalid UUID format for 'id': %v", i, err)
			continue
		}

		teamNameRaw, nameExists := teamMap["name"]
		if !nameExists {
			log.Warnf("Skipping team at index %d: missing 'name' field", i)
			continue
		}
		teamName, isNameString := teamNameRaw.(string)
		if !isNameString {
			log.Warnf("Skipping team at index %d: 'name' field is not a string", i)
			continue
		}
		team := coursePhaseConfigDTO.Team{
			ID:   teamID,
			Name: teamName,
		}
		teams = append(teams, team)
	}

	return teams, nil
}
