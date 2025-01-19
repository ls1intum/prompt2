package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type UpdateCoursePhaseParticipationRequest struct {
	// we require this as the ID might be empty
	// CoursePhase ID is in the URL
	CourseParticipationID uuid.UUID      `json:"course_participation_id"`
	PassStatus            *db.PassStatus `json:"pass_status"`
	MetaData              meta.MetaData  `json:"meta_data"`
}

type UpdateCoursePhaseParticipation struct {
	ID         uuid.UUID      `json:"id"`
	PassStatus *db.PassStatus `json:"passed"`
	MetaData   meta.MetaData  `json:"meta_data"`
}

func (c UpdateCoursePhaseParticipation) GetDBModel() (db.UpdateCoursePhaseParticipationParams, error) {
	metaDataBytes, err := c.MetaData.GetDBModel()
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DB model from DTO")
		return db.UpdateCoursePhaseParticipationParams{}, err
	}

	return db.UpdateCoursePhaseParticipationParams{
		ID:         c.ID,
		PassStatus: GetPassStatusDBModel(c.PassStatus),
		MetaData:   metaDataBytes,
	}, nil
}
