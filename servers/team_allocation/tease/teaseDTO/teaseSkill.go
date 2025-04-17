package teaseDTO

import (
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

type Skill struct {
	SkillTitle       string `json:"skillTitle"`
	SkillID          string `json:"skillId"`
	SkillDescription string `json:"skillDescription"`
}

func GetTeaseSkillFromDBModel(skills []db.Skill) []Skill {
	teaseSkills := make([]Skill, 0, len(skills))
	for _, skill := range skills {
		teaseSkill := Skill{
			SkillTitle:       skill.Name,
			SkillID:          skill.ID.String(),
			SkillDescription: "",
		}
		teaseSkills = append(teaseSkills, teaseSkill)
	}
	return teaseSkills
}
