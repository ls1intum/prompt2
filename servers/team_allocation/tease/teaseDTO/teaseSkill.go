package teaseDTO

import (
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

type Skill struct {
	Title       string `json:"title"`
	ID          string `json:"id"`
	Description string `json:"description"`
}

func GetTeaseSkillFromDBModel(skills []db.Skill) []Skill {
	teaseSkills := make([]Skill, 0, len(skills))
	for _, skill := range skills {
		teaseSkill := Skill{
			Title:       skill.Name,
			ID:          skill.ID.String(),
			Description: "",
		}
		teaseSkills = append(teaseSkills, teaseSkill)
	}
	return teaseSkills
}
