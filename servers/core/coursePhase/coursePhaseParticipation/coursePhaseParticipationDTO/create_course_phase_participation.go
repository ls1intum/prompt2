package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type CreateCoursePhaseParticipation struct {
	CourseParticipationID uuid.UUID      `json:"courseParticipationID"`
	CoursePhaseID         uuid.UUID      `json:"coursePhaseID"`
	PassStatus            *db.PassStatus `json:"passStatus"`
	RestrictedData        meta.MetaData  `json:"restrictedData"`
	StudentReadableData   meta.MetaData  `json:"studentReadableData"`
}

func (c CreateCoursePhaseParticipation) GetDBModel() (db.CreateCoursePhaseParticipationParams, error) {
	restrictedDataBytes, err := c.RestrictedData.GetDBModel()
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DB model from DTO")
		return db.CreateCoursePhaseParticipationParams{}, err
	}

	studentReadableDataBytes, err := c.StudentReadableData.GetDBModel()
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DB model from DTO")
		return db.CreateCoursePhaseParticipationParams{}, err
	}

	return db.CreateCoursePhaseParticipationParams{
		CourseParticipationID: c.CourseParticipationID,
		CoursePhaseID:         c.CoursePhaseID,
		PassStatus:            GetPassStatusDBModel(c.PassStatus),
		RestrictedData:        restrictedDataBytes,
		StudentReadableData:   studentReadableDataBytes,
	}, nil

}
