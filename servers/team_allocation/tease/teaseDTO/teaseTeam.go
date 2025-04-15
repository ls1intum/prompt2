package teaseDTO

import (
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

type TeaseTeam struct {
	TeamID   string `json:"id"`
	TeamName string `json:"name"`
}

func GetTeaseTeamResponseFromDBModel(teams []db.Team) []TeaseTeam {
	var teaseTeams []TeaseTeam
	for _, team := range teams {
		teaseTeam := TeaseTeam{
			TeamID:   team.ID.String(),
			TeamName: team.Name,
		}
		teaseTeams = append(teaseTeams, teaseTeam)
	}
	return teaseTeams
}
