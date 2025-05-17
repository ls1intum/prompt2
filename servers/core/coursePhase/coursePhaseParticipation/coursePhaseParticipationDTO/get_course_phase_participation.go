package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/meta"
	log "github.com/sirupsen/logrus"
)

type GetCoursePhaseParticipation struct {
	CourseParticipationID uuid.UUID     `json:"courseParticipationID"`
	CoursePhaseID         uuid.UUID     `json:"coursePhaseID"`
	PassStatus            string        `json:"passStatus"`
	RestrictedData        meta.MetaData `json:"restrictedData"`
	StudentReadableData   meta.MetaData `json:"studentReadableData"`
}

func GetCoursePhaseParticipationDTOFromDBModel(model db.CoursePhaseParticipation) (GetCoursePhaseParticipation, error) {
	restrictedData, err := meta.GetMetaDataDTOFromDBModel(model.RestrictedData)
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DTO from DB model")
		return GetCoursePhaseParticipation{}, err
	}

	studentReadableData, err := meta.GetMetaDataDTOFromDBModel(model.StudentReadableData)
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DTO from DB model")
		return GetCoursePhaseParticipation{}, err
	}

	return GetCoursePhaseParticipation{
		CourseParticipationID: model.CourseParticipationID,
		CoursePhaseID:         model.CoursePhaseID,
		PassStatus:            GetPassStatusString(model.PassStatus),
		RestrictedData:        restrictedData,
		StudentReadableData:   studentReadableData,
	}, nil
}
