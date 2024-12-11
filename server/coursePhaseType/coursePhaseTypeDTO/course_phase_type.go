package coursePhaseTypeDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type CoursePhaseType struct {
	ID                     uuid.UUID     `json:"id"`
	Name                   string        `json:"name"`
	RequiredInputMetaData  meta.MetaData `json:"required_input_meta_data"`
	ProvidedOutputMetaData meta.MetaData `json:"provided_output_meta_data"`
	InitialPhase           bool          `json:"initial_phase"`
}

func GetCoursePhaseTypeDTOFromDBModel(model db.CoursePhaseType) (CoursePhaseType, error) {
	inputMetaData, err := meta.GetMetaDataDTOFromDBModel(model.RequiredInputMetaData)
	if err != nil {
		return CoursePhaseType{}, err
	}

	outputMetaData, err := meta.GetMetaDataDTOFromDBModel(model.ProvidedOutputMetaData)
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
