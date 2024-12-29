package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type CreateCoursePhaseParticipation struct {
	CourseParticipationID uuid.UUID         `json:"course_participation_id"`
	CoursePhaseID         uuid.UUID         `json:"course_phase_id"`
	PassStatus            db.NullPassStatus `json:"pass_status"`
	MetaData              meta.MetaData     `json:"meta_data"`
}

func (c CreateCoursePhaseParticipation) GetDBModel() (db.CreateCoursePhaseParticipationParams, error) {
	metaDataBytes, err := c.MetaData.GetDBModel()
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DB model from DTO")
		return db.CreateCoursePhaseParticipationParams{}, err
	}

	return db.CreateCoursePhaseParticipationParams{
		CourseParticipationID: c.CourseParticipationID,
		CoursePhaseID:         c.CoursePhaseID,
		PassStatus:            c.PassStatus,
		MetaData:              metaDataBytes,
	}, nil

}
