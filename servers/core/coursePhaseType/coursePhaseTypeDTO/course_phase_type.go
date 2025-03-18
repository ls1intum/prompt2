package coursePhaseTypeDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CoursePhaseType struct {
	ID                              uuid.UUID                `json:"id"`
	Name                            string                   `json:"name"`
	BaseUrl                         string                   `json:"baseUrl"`
	InitialPhase                    bool                     `json:"initialPhase"`
	RequiredParticipationInputDTOs  []ParticipationInputDTO  `json:"requiredParticipationInputDTOs"`
	ProvidedParticipationOutputDTOs []ParticipationOutputDTO `json:"providedParticipationOutputDTOs"`
	RequiredPhaseInputDTOs          []PhaseInputDTO          `json:"requiredPhaseInputDTOs"`
	ProvidedPhaseOutputDTOs         []PhaseOutputDTO         `json:"providedPhaseOutputDTOs"`
}

func GetCoursePhaseTypeDTOFromDBModel(model db.CoursePhaseType, requiredParticipationInputs []ParticipationInputDTO, providedParticipationOutputs []ParticipationOutputDTO, requiredPhaseInputs []PhaseInputDTO, providedPhaseOutputs []PhaseOutputDTO) (CoursePhaseType, error) {
	return CoursePhaseType{
		ID:                              model.ID,
		Name:                            model.Name,
		BaseUrl:                         model.BaseUrl,
		InitialPhase:                    model.InitialPhase,
		RequiredParticipationInputDTOs:  requiredParticipationInputs,
		ProvidedParticipationOutputDTOs: providedParticipationOutputs,
		RequiredPhaseInputDTOs:          requiredPhaseInputs,
		ProvidedPhaseOutputDTOs:         providedPhaseOutputs,
	}, nil
}
