package teamDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

type Team struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

func GetTeamDTOFromDBModel(dbTeam db.Team) Team {
	return Team{
		ID:   dbTeam.ID,
		Name: dbTeam.Name,
	}
}

func GetTeamDTOsFromDBModels(dbTeams []db.Team) []Team {
	teams := make([]Team, 0, len(dbTeams))
	for _, dbTeam := range dbTeams {
		teams = append(teams, GetTeamDTOFromDBModel(dbTeam))
	}
	return teams
}
