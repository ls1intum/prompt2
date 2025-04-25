package teams

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
	"github.com/ls1intum/prompt2/servers/team_allocation/team/teamDTO"
	log "github.com/sirupsen/logrus"
)

type TeamsService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var TeamsServiceSingleton *TeamsService

func GetAllTeams(ctx context.Context, coursePhaseID uuid.UUID) ([]teamDTO.Team, error) {
	dbTeams, err := TeamsServiceSingleton.queries.GetTeamsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get the teams from the database: ", err)
		return nil, errors.New("could not get the teams from the database")
	}
	return teamDTO.GetTeamDTOsFromDBModels(dbTeams), nil
}

func GetTeamByID(ctx context.Context, coursePhaseID uuid.UUID, teamID uuid.UUID) (teamDTO.Team, error) {
	dbTeam, err := TeamsServiceSingleton.queries.GetTeamByCoursePhaseAndTeamID(ctx, db.GetTeamByCoursePhaseAndTeamIDParams{
		ID:            teamID,
		CoursePhaseID: coursePhaseID,
	})
	if err != nil {
		log.Error("could not get the teams from the database: ", err)
		return teamDTO.Team{}, errors.New("could not get the teams from the database")
	}
	return teamDTO.GetTeamDTOFromDBModel(dbTeam), nil
}

func CreateNewTeams(ctx context.Context, teamNames []string, coursePhaseID uuid.UUID) error {
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
