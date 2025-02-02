package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type UpdateCoursePhaseParticipationRequest struct {
	// for individual updates, the ID is in the url
	// for batch updates, the ID is in the body
	ID                    uuid.UUID      `json:"id"`
	CourseParticipationID uuid.UUID      `json:"courseParticipationID"`
	PassStatus            *db.PassStatus `json:"passStatus"`
	RestrictedData        meta.MetaData  `json:"restrictedData"`
	StudentReadableData   meta.MetaData  `json:"studentReadableData"`
}

type UpdateCoursePhaseParticipation struct {
	ID                  uuid.UUID      `json:"id"`
	PassStatus          *db.PassStatus `json:"passStatus"`
	RestrictedData      meta.MetaData  `json:"restrictedData"`
	StudentReadableData meta.MetaData  `json:"studentReadableData"`
	CoursePhaseID       uuid.UUID      `json:"coursePhaseID"`
}

func (c UpdateCoursePhaseParticipation) GetDBModel() (db.UpdateCoursePhaseParticipationParams, error) {
	restrictedData, err := c.RestrictedData.GetDBModel()
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DB model from DTO")
		return db.UpdateCoursePhaseParticipationParams{}, err
	}

	studentReadableData, err := c.StudentReadableData.GetDBModel()
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DB model from DTO")
		return db.UpdateCoursePhaseParticipationParams{}, err
	}

	return db.UpdateCoursePhaseParticipationParams{
		ID:                  c.ID,
		PassStatus:          GetPassStatusDBModel(c.PassStatus),
		RestrictedData:      restrictedData,
		StudentReadableData: studentReadableData,
		CoursePhaseID:       c.CoursePhaseID,
	}, nil
}
