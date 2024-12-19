package coursePhaseTypeDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CoursePhaseType struct {
	ID                     uuid.UUID        `json:"id"`
	Name                   string           `json:"name"`
	RequiredInputMetaData  []MetaTypeObject `json:"required_input_meta_data"`
	ProvidedOutputMetaData []MetaTypeObject `json:"provided_output_meta_data"`
	InitialPhase           bool             `json:"initial_phase"`
}

func GetCoursePhaseTypeDTOFromDBModel(model db.CoursePhaseType) (CoursePhaseType, error) {
	inputMetaData, err := getMetaTypeArrayDTOFromDBModel(model.RequiredInputMetaData)
	if err != nil {
		return CoursePhaseType{}, err
	}

	outputMetaData, err := getMetaTypeArrayDTOFromDBModel(model.ProvidedOutputMetaData)
	if err != nil {
		return CoursePhaseType{}, err
	}

	return CoursePhaseType{
		ID:                     model.ID,
		Name:                   model.Name,
		RequiredInputMetaData:  inputMetaData,
		ProvidedOutputMetaData: outputMetaData,
		InitialPhase:           model.InitialPhase,
	}, nil
}
