package teams

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/self_team_assignment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/self_team_assignment/team/teamDTO"
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

func GetAllTeams(ctx context.Context, coursePhaseID uuid.UUID) ([]teamDTO.Team, error) {
	dbTeams, err := TeamsServiceSingleton.queries.GetTeamsWithStudentNames(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get the teams from the database: ", err)
		return nil, errors.New("could not get the teams from the database")
	}
	return teamDTO.GetTeamWithFullNameDTOsFromDBModels(dbTeams), nil
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

func AssignTeam(ctx context.Context, coursePhaseID, teamID uuid.UUID, courseParticipationID uuid.UUID, studentFullName string) error {
	err := AssignmentServiceSingleton.queries.CreateOrUpdateAssignment(ctx, db.CreateOrUpdateAssignmentParams{
		TeamID:                teamID,
		CoursePhaseID:         coursePhaseID,
		CourseParticipationID: courseParticipationID,
		StudentFullName:       studentFullName,
	})

	if err != nil {
		log.Error("could not update the team: ", err)
		return errors.New("could not update the team")
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
