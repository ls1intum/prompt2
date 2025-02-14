package coursePhaseTypeDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CoursePhaseType struct {
	ID                 uuid.UUID           `json:"id"`
	Name               string              `json:"name"`
	BaseUrl            string              `json:"baseUrl"`
	InitialPhase       bool                `json:"initialPhase"`
	RequiredInputDTOs  []RequiredInputDTO  `json:"requiredInputDTOs"`
	ProvidedOutputDTOs []ProvidedOutputDTO `json:"providedOutputDTOs"`
}

func GetCoursePhaseTypeDTOFromDBModel(model db.CoursePhaseType, requiredInputs []RequiredInputDTO, providedOutputs []ProvidedOutputDTO) (CoursePhaseType, error) {
	return CoursePhaseType{
		ID:                 model.ID,
		Name:               model.Name,
		BaseUrl:            model.BaseUrl,
		InitialPhase:       model.InitialPhase,
		RequiredInputDTOs:  requiredInputs,
		ProvidedOutputDTOs: providedOutputs,
	}, nil
}
