package teamDTO

import (
	"encoding/json"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

type Team struct {
	ID      uuid.UUID `json:"id" binding:"uuid"`
	Name    string    `json:"name" binding:"required"`
	Members []Person  `json:"members" binding:"dive"`
	Tutors  []Person  `json:"tutors" binding:"dive"`
}

type Person struct {
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
	FirstName             string    `json:"firstName"`
	LastName              string    `json:"lastName"`
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

func GetTeamsWithMembersDTOFromDBModel(dbTeams []db.GetTeamsWithMembersRow) ([]Team, error) {
	teams := make([]Team, 0, len(dbTeams))
	for _, dbTeam := range dbTeams {
		t, err := GetTeamWithMembersDTOFromDBModel(dbTeam)
		if err != nil {
			return nil, err
		}
		teams = append(teams, t)
	}
	return teams, nil
}

func GetTeamWithMembersDTOFromDBModel(dbTeam db.GetTeamsWithMembersRow) (Team, error) {
	var members []Person
	var tutors []Person
	// unmarshal the JSON blob into your slice of structs
	if err := json.Unmarshal(dbTeam.TeamMembers, &members); err != nil {
		return Team{}, err
	}
	if err := json.Unmarshal(dbTeam.TeamTutors, &tutors); err != nil {
		return Team{}, err
	}

	return Team{
		ID:      dbTeam.ID,
		Name:    dbTeam.Name,
		Members: members,
		Tutors:  tutors,
	}, nil
}
