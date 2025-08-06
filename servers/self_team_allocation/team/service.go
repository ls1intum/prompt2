package teams

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt-sdk/promptTypes"
	db "github.com/ls1intum/prompt2/servers/self_team_allocation/db/sqlc"
	"github.com/ls1intum/prompt2/servers/self_team_allocation/team/teamDTO"
	"github.com/ls1intum/prompt2/servers/self_team_allocation/timeframe"
	log "github.com/sirupsen/logrus"
)

type TeamsService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var TeamsServiceSingleton *TeamsService

type AssignmentService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var AssignmentServiceSingleton *AssignmentService

func GetAllTeams(ctx context.Context, coursePhaseID uuid.UUID) ([]promptTypes.Team, error) {
	dbTeams, err := TeamsServiceSingleton.queries.GetTeamsWithStudentNames(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get the teams from the database: ", err)
		return nil, errors.New("could not get the teams from the database")
	}
	dtos, err := teamDTO.GetTeamWithFullNameDTOsFromDBModels(dbTeams)
	if err != nil {
		log.Error("could not get the teams from the database: ", err)
		return nil, errors.New("could not get the teams from the database")
	}
	return dtos, nil
}

func GetTeamByID(ctx context.Context, coursePhaseID uuid.UUID, teamID uuid.UUID) (promptTypes.Team, error) {
	dbTeam, err := TeamsServiceSingleton.queries.GetTeamWithStudentNamesByTeamID(ctx, db.GetTeamWithStudentNamesByTeamIDParams{
		ID:            teamID,
		CoursePhaseID: coursePhaseID,
	})
	if err != nil {
		log.Error("could not get the teams from the database: ", err)
		return promptTypes.Team{}, errors.New("could not get the teams from the database")
	}
	dto, err := teamDTO.GetTeamWithFullNamesByIdDTOFromDBModel(dbTeam)
	if err != nil {
		log.Error("could not get the teams from the database: ", err)
		return promptTypes.Team{}, errors.New("could not get the teams from the database")
	}
	return dto, nil
}

func CreateNewTeams(ctx context.Context, teamNames []string, coursePhaseID uuid.UUID) error {
	// Validate team names
	for _, name := range teamNames {
		if name == "" {
			return errors.New("team name cannot be empty")
		}
	}

	tx, err := TeamsServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)
	qtx := TeamsServiceSingleton.queries.WithTx(tx)

	for _, teamName := range teamNames {
		err := qtx.CreateTeam(ctx, db.CreateTeamParams{
			ID:            uuid.New(),
			Name:          teamName,
			CoursePhaseID: coursePhaseID,
		})
		if err != nil {
			log.Error("error creating the teams ", err)
			return errors.New("error creating the teams")
		}
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func UpdateTeam(ctx context.Context, coursePhaseID, teamID uuid.UUID, newTeamName string) error {
	err := TeamsServiceSingleton.queries.UpdateTeam(ctx, db.UpdateTeamParams{
		ID:            teamID,
		CoursePhaseID: coursePhaseID,
		Name:          newTeamName,
	})
	if err != nil {
		log.Error("could not update the team: ", err)
		return errors.New("could not update the team")
	}
	return nil
}

func AssignTeam(ctx context.Context, coursePhaseID, teamID uuid.UUID, courseParticipationID uuid.UUID, studentFullName string) error {
	err := AssignmentServiceSingleton.queries.CreateOrUpdateAssignment(ctx, db.CreateOrUpdateAssignmentParams{
		ID:                    uuid.New(),
		TeamID:                teamID,
		CoursePhaseID:         coursePhaseID,
		CourseParticipationID: courseParticipationID,
		StudentFullName:       studentFullName,
	})

	if err != nil {
		log.Error("could not assign student to team: ", err)
		return errors.New("could not assign student to team")
	}
	return nil
}

func LeaveTeam(ctx context.Context, coursePhaseID, teamID uuid.UUID, courseParticipationID uuid.UUID) error {
	err := AssignmentServiceSingleton.queries.DeleteAssignment(ctx, db.DeleteAssignmentParams{
		TeamID:                teamID,
		CoursePhaseID:         coursePhaseID,
		CourseParticipationID: courseParticipationID,
	})

	if err != nil {
		log.Error("could not leave the team: ", err)
		return errors.New("could not leave the team")
	}
	return nil
}

func DeleteTeam(ctx context.Context, coursePhaseID, teamID uuid.UUID) error {
	err := TeamsServiceSingleton.queries.DeleteTeam(ctx, db.DeleteTeamParams{
		ID:            teamID,
		CoursePhaseID: coursePhaseID,
	})
	if err != nil {
		log.Error("could not delete the team: ", err)
		return errors.New("could not delete the team")
	}
	return nil
}

func ValidateTimeframe(ctx context.Context, coursePhaseID uuid.UUID) (bool, error) {
	timeframeDTO, err := timeframe.GetTimeframe(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get the timeframe: ", err)
		return false, errors.New("could not get the timeframe")
	}

	if !timeframeDTO.TimeframeSet {
		log.Warn("timeframe not set")
		return true, nil
	}

	if time.Now().Before(timeframeDTO.StartTime) || time.Now().After(timeframeDTO.EndTime) {
		return false, errors.New("request is outside the allowed timeframe")
	}
	return true, nil
}
