package surveyDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

type StudentSkillResponse struct {
	SkillID uuid.UUID `json:"skillID"`
	Rating  int32     `json:"rating"`
}

func GetStudentSkillResponsesDTOFromDBModel(skills []db.GetStudentSkillResponsesRow) []StudentSkillResponse {
	skillDTOs := make([]StudentSkillResponse, 0, len(skills))
	for _, skill := range skills {
		skillDTOs = append(skillDTOs, StudentSkillResponse{
			SkillID: skill.SkillID,
			Rating:  skill.Rating,
		})
	}
	return skillDTOs
}
