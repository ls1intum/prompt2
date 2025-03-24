package surveyDTO

import (
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
	"github.com/ls1intum/prompt2/servers/team_allocation/skills/skillDTO"
	"github.com/ls1intum/prompt2/servers/team_allocation/team/teamDTO"
)

type SurveyData struct {
	Teams  []teamDTO.Team   `json:"teams"`
	Skills []skillDTO.Skill `json:"skills"`
}

func GetSurveyDataDTOFromDBModels(teams []db.Team, skills []db.Skill) SurveyData {
	teamsDTO := teamDTO.GetTeamDTOsFromDBModels(teams)
	skillsDTO := skillDTO.GetSkillDTOsFromDBModels(skills)

	return SurveyData{
		Teams:  teamsDTO,
		Skills: skillsDTO,
	}
}
