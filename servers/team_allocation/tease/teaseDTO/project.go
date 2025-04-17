package teaseDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

type ProjectPreference struct {
	ProjectID uuid.UUID `json:"projectId"`
	Priority  int32     `json:"priority"`
}

func GetProjectPreferenceFromDBModel(teamPreferences []db.GetStudentTeamPreferencesRow) []ProjectPreference {
	projectPreferences := make([]ProjectPreference, 0, len(teamPreferences))
	for _, teamPreference := range teamPreferences {
		projectPreferences = append(projectPreferences, ProjectPreference{
			ProjectID: teamPreference.TeamID,
			Priority:  teamPreference.Preference,
		})
	}
	return projectPreferences
}
