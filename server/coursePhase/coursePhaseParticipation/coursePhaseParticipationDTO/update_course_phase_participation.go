package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type UpdateCoursePhaseParticipation struct {
	ID       uuid.UUID     `json:"id"`
	Passed   pgtype.Bool   `json:"passed"`
	MetaData meta.MetaData `json:"meta_data"`
}

func (c UpdateCoursePhaseParticipation) GetDBModel() (db.UpdateCoursePhaseParticipationParams, error) {
	metaDataBytes, err := c.MetaData.GetDBModel()
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DB model from DTO")
		return db.UpdateCoursePhaseParticipationParams{}, err
	}

	return db.UpdateCoursePhaseParticipationParams{
		ID:       c.ID,
		Passed:   c.Passed,
		MetaData: metaDataBytes,
	}, nil

}

func UpdateCoursePhaseParticipationDTOFromDBModel(model db.CoursePhaseParticipation) (UpdateCoursePhaseParticipation, error) {
	metaData, err := meta.GetMetaDataDTOFromDBModel(model.MetaData)
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DTO from DB model")
		return UpdateCoursePhaseParticipation{}, err
	}

	return UpdateCoursePhaseParticipation{
		ID:       model.ID,
		Passed:   model.Passed,
		MetaData: metaData,
	}, nil
}
