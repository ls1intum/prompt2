package coursePhaseDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type CoursePhase struct {
	ID                  uuid.UUID     `json:"id"`
	CourseID            uuid.UUID     `json:"courseID"`
	Name                string        `json:"name"`
	IsInitialPhase      bool          `json:"isInitialPhase"`
	MetaData            meta.MetaData `json:"metaData"`
	CoursePhaseTypeID   uuid.UUID     `json:"coursePhaseTypeID"`
	CoursePhaseTypeName string        `json:"coursePhaseTypeName"`
}

func GetCoursePhaseDTOFromDBModel(model db.GetCoursePhaseRow) (CoursePhase, error) {
	metaData, err := meta.GetMetaDataDTOFromDBModel(model.MetaData)
	if err != nil {
		return CoursePhase{}, err
	}

	return CoursePhase{
		ID:                  model.ID,
		CourseID:            model.CourseID,
		Name:                model.Name.String,
		IsInitialPhase:      model.IsInitialPhase,
		MetaData:            metaData,
		CoursePhaseTypeID:   model.CoursePhaseTypeID,
		CoursePhaseTypeName: model.CoursePhaseTypeName,
	}, nil
}
