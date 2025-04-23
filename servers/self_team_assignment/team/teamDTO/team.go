package teamDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/self_team_assignment/db/sqlc"
)

type Team struct {
	ID      uuid.UUID `json:"id"`
	Name    string    `json:"name"`
	Members []string  `json:"members"`
}

func GetTeamDTOFromDBModel(dbTeam db.GetTeamsWithStudentNamesRow) Team {
	return Team{
		ID:      dbTeam.ID,
		Name:    dbTeam.Name,
		Members: dbTeam.StudentNames,
	}
}

func GetTeamWithFullNameDTOsFromDBModels(dbTeams []db.GetTeamsWithStudentNamesRow) []Team {
	teams := make([]Team, 0, len(dbTeams))
	for _, dbTeam := range dbTeams {
		teams = append(teams, GetTeamDTOFromDBModel(dbTeam))
	}
	return teams
}
