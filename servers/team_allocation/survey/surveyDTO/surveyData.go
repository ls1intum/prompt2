package surveyDTO

import (
	"time"

	"github.com/ls1intum/prompt-sdk/promptTypes"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
	"github.com/ls1intum/prompt2/servers/team_allocation/skills/skillDTO"
	"github.com/ls1intum/prompt2/servers/team_allocation/team/teamDTO"
)

type SurveyForm struct {
	Teams    []promptTypes.Team `json:"teams"`
	Skills   []skillDTO.Skill   `json:"skills"`
	Deadline time.Time          `json:"deadline"`
}

func GetSurveyDataDTOFromDBModels(teams []db.Team, skills []db.Skill, deadline time.Time) SurveyForm {
	teamsDTO := teamDTO.GetTeamDTOsFromDBModels(teams)
	skillsDTO := skillDTO.GetSkillDTOsFromDBModels(skills)

	return SurveyForm{
		Teams:    teamsDTO,
		Skills:   skillsDTO,
		Deadline: deadline,
	}
}
