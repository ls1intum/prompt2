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
	"github.com/ls1intum/prompt-sdk/promptTypes"
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

// NewCoursePhaseConfigService creates a new CoursePhaseConfigService instance
func NewCoursePhaseConfigService(queries db.Queries, conn *pgxpool.Pool) *CoursePhaseConfigService {
	return &CoursePhaseConfigService{
		queries: queries,
		conn:    conn,
	}
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

func GetParticipationsForCoursePhase(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]promptTypes.CoursePhaseParticipationWithStudent, error) {
	coreURL := utils.GetCoreUrl()
	participations, err := promptSDK.FetchAndMergeParticipationsWithResolutions(coreURL, authHeader, coursePhaseID)
	if err != nil {
		log.Error("could not fetch course phase participations with students: ", err)
		return nil, errors.New("could not fetch course phase participations with students")
	}
	log.Infof("Fetched participations for course phase %s: %+v", coursePhaseID, participations)

	return participations, nil
}

func GetTeamsForCoursePhase(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]coursePhaseConfigDTO.Team, error) {
	// fetch all Teams
	coreURL := utils.GetCoreUrl()
	cpWithResoultion, err := promptSDK.FetchAndMergeCoursePhaseWithResolution(coreURL, authHeader, coursePhaseID)
	if err != nil {
		log.Error("could not fetch course phase with resolution: ", err)
		return nil, errors.New("could not fetch course phase with resolution")
	}
	log.Infof("Fetched course phase with resolution: %+v", cpWithResoultion)

	// Extract teams from the fetched course phase resolution
	teams := make([]coursePhaseConfigDTO.Team, 0)

	// Safely extract teams slice
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
		// Safely extract team map
		teamMap, isMap := teamData.(map[string]interface{})
		if !isMap {
			log.Warnf("Skipping team at index %d: not a valid map", i)
			continue
		}

		// Safely extract team ID
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

		// Safely extract team name
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
