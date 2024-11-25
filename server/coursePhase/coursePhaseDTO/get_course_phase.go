package coursePhaseDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type CoursePhase struct {
	ID                uuid.UUID     `json:"id"`
	CourseID          uuid.UUID     `json:"course_id"`
	Name              string        `json:"name"`
	IsInitialPhase    bool          `json:"is_initial_phase"`
	MetaData          meta.MetaData `json:"meta_data"`
	CoursePhaseTypeID uuid.UUID     `json:"course_phase_type_id"`
}

func GetCoursePhaseDTOFromDBModel(model db.CoursePhase) (CoursePhase, error) {
	metaData, err := meta.GetMetaDataDTOFromDBModel(model.MetaData)
	if err != nil {
		return CoursePhase{}, err
	}

	return CoursePhase{
		ID:                model.ID,
		CourseID:          model.CourseID,
		Name:              model.Name.String,
		IsInitialPhase:    model.IsInitialPhase,
		MetaData:          metaData,
		CoursePhaseTypeID: model.CoursePhaseTypeID,
	}, nil
}
