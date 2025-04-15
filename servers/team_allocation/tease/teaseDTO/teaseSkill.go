package teaseDTO

import (
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

type SkillResponse struct {
	SkillTitle       string `json:"skillTitle"`
	SkillID          string `json:"skillId"`
	SkillDescription string `json:"skillDescription"`
}

func GetTeaseSkillResponseFromDBModel(skills []db.Skill) []SkillResponse {
	var teaseSkills []SkillResponse
	for _, skill := range skills {
		teaseSkill := SkillResponse{
			SkillTitle:       skill.Name,
			SkillID:          skill.ID.String(),
			SkillDescription: "",
		}
		teaseSkills = append(teaseSkills, teaseSkill)
	}
	return teaseSkills
}
