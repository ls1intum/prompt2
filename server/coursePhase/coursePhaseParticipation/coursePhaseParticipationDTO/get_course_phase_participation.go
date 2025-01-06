package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type GetCoursePhaseParticipation struct {
	ID                    uuid.UUID     `json:"id"`
	CourseParticipationID uuid.UUID     `json:"course_participation_id"`
	CoursePhaseID         uuid.UUID     `json:"course_phase_id"`
	PassStatus            string        `json:"passed_status"`
	MetaData              meta.MetaData `json:"meta_data"`
}

func GetCoursePhaseParticipationDTOFromDBModel(model db.CoursePhaseParticipation) (GetCoursePhaseParticipation, error) {
	metaData, err := meta.GetMetaDataDTOFromDBModel(model.MetaData)
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DTO from DB model")
		return GetCoursePhaseParticipation{}, err
	}

	return GetCoursePhaseParticipation{
		ID:                    model.ID,
		CourseParticipationID: model.CourseParticipationID,
		CoursePhaseID:         model.CoursePhaseID,
		PassStatus:            GetPassStatusString(model.PassStatus),
		MetaData:              metaData,
	}, nil
}
