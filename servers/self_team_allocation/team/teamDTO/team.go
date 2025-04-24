package teamDTO

import (
	"encoding/json"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/self_team_allocation/db/sqlc"
)

type Team struct {
	ID      uuid.UUID    `json:"id"`
	Name    string       `json:"name"`
	Members []TeamMember `json:"members"`
}

type TeamMember struct {
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
	StudentName           string    `json:"studentName"`
}

func GetTeamDTOFromDBModel(dbTeam db.GetTeamsWithStudentNamesRow) (Team, error) {
	var members []TeamMember
	// unmarshal the JSON blob into your slice of structs
	if err := json.Unmarshal(dbTeam.TeamMembers, &members); err != nil {
		return Team{}, err
	}

	return Team{
		ID:      dbTeam.ID,
		Name:    dbTeam.Name,
		Members: members,
	}, nil
}

func GetTeamDTOFromTeamIDDBModel(dbTeam db.GetTeamWithStudentNamesByTeamIDRow) (Team, error) {
	var members []TeamMember
	// unmarshal the JSON blob into your slice of structs
	if err := json.Unmarshal(dbTeam.TeamMembers, &members); err != nil {
		return Team{}, err
	}

	return Team{
		ID:      dbTeam.ID,
		Name:    dbTeam.Name,
		Members: members,
	}, nil
}

func GetTeamWithFullNameDTOsFromDBModels(dbTeams []db.GetTeamsWithStudentNamesRow) ([]Team, error) {
	teams := make([]Team, 0, len(dbTeams))
	for _, dbTeam := range dbTeams {
		t, err := GetTeamDTOFromDBModel(dbTeam)
		if err != nil {
			// handle or log error; skip or abort as you preferable
			return nil, err
		}
		teams = append(teams, t)
	}
	return teams, nil
}
