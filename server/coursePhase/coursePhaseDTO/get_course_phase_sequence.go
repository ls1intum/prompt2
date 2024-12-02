package coursePhaseDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type CoursePhaseSequence struct {
	ID                uuid.UUID     `json:"id"`
	CourseID          uuid.UUID     `json:"course_id"`
	Name              string        `json:"name"`
	MetaData          meta.MetaData `json:"meta_data"`
	IsInitialPhase    bool          `json:"is_initial_phase"`
	SequenceOrder     int           `json:"sequence_order"`
	CoursePhaseTypeID uuid.UUID     `json:"course_phase_type_id"`
	CoursePhaseType   string        `json:"course_phase_type"`
}

func GetCoursePhaseSequenceDTOFromDBModel(model db.GetCoursePhaseSequenceRow) (CoursePhaseSequence, error) {
	metaData, err := meta.GetMetaDataDTOFromDBModel(model.MetaData)
	if err != nil {
		return CoursePhaseSequence{}, err
	}

	return CoursePhaseSequence{
		ID:                model.ID,
		CourseID:          model.CourseID,
		Name:              model.Name.String,
		MetaData:          metaData,
		IsInitialPhase:    model.IsInitialPhase,
		SequenceOrder:     int(model.SequenceOrder),
		CoursePhaseTypeID: model.CoursePhaseTypeID,
		CoursePhaseType:   model.CoursePhaseTypeName,
	}, nil
}

func GetCoursePhaseSequenceDTO(orderedPhases []db.GetCoursePhaseSequenceRow, notOrderedPhases []db.GetNotOrderedCoursePhasesRow) ([]CoursePhaseSequence, error) {
	coursePhases := make([]CoursePhaseSequence, 0, len(orderedPhases)+len(notOrderedPhases))
	for _, phase := range orderedPhases {
		coursePhase, err := GetCoursePhaseSequenceDTOFromDBModel(phase)
		if err != nil {
			return nil, err
		}
		coursePhases = append(coursePhases, coursePhase)
	}

	for _, phase := range notOrderedPhases {
		coursePhase, err := GetCoursePhaseSequenceDTOFromDBModel(db.GetCoursePhaseSequenceRow{
			ID:                  phase.ID,
			CourseID:            phase.CourseID,
			Name:                phase.Name,
			MetaData:            phase.MetaData,
			IsInitialPhase:      phase.IsInitialPhase,
			SequenceOrder:       -1,
			CoursePhaseTypeID:   phase.CoursePhaseTypeID,
			CoursePhaseTypeName: phase.CoursePhaseTypeName,
		})
		if err != nil {
			return nil, err
		}
		coursePhases = append(coursePhases, coursePhase)
	}

	return coursePhases, nil
}
