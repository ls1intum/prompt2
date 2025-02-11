package coursePhaseTypeDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CoursePhaseType struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	BaseUrl      string    `json:"baseUrl"`
	InitialPhase bool      `json:"initialPhase"`
}

func GetCoursePhaseTypeDTOFromDBModel(model db.CoursePhaseType) (CoursePhaseType, error) {
	// inputMetaData, err := getMetaTypeArrayDTOFromDBModel(model.RequiredInputMetaData)
	// if err != nil {
	// 	return CoursePhaseType{}, err
	// }

	// outputMetaData, err := getMetaTypeArrayDTOFromDBModel(model.ProvidedOutputMetaData)
	// if err != nil {
	// 	return CoursePhaseType{}, err
	// }

	return CoursePhaseType{
		ID:           model.ID,
		Name:         model.Name,
		BaseUrl:      model.BaseUrl,
		InitialPhase: model.InitialPhase,
	}, nil
}
