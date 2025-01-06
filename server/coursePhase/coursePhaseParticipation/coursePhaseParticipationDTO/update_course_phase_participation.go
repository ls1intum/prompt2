package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type UpdateCoursePhaseParticipation struct {
	ID         uuid.UUID         `json:"id"`
	PassStatus db.NullPassStatus `json:"passed"`
	MetaData   meta.MetaData     `json:"meta_data"`
}

func (c UpdateCoursePhaseParticipation) GetDBModel() (db.UpdateCoursePhaseParticipationParams, error) {
	metaDataBytes, err := c.MetaData.GetDBModel()
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DB model from DTO")
		return db.UpdateCoursePhaseParticipationParams{}, err
	}

	return db.UpdateCoursePhaseParticipationParams{
		ID:         c.ID,
		PassStatus: c.PassStatus,
		MetaData:   metaDataBytes,
	}, nil

}
