package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type Resolution struct {
	DtoName       string    `json:"dtoName"`
	BaseURL       string    `json:"baseURL"`
	EndpointPath  string    `json:"endpointPath"`
	CoursePhaseID uuid.UUID `json:"coursePhaseID"`
}

func GetResolutionDTOFromDBModel(model db.GetResolutionsForCoursePhaseRow) Resolution {
	return Resolution{
		DtoName:       model.DtoName,
		BaseURL:       model.BaseUrl,
		EndpointPath:  model.EndpointPath,
		CoursePhaseID: model.FromCoursePhaseID,
	}
}
