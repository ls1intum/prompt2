package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/student/studentDTO"
	log "github.com/sirupsen/logrus"
)

type ApplicationParticipation struct {
	ID             uuid.UUID          `json:"id"`
	PassStatus     string             `json:"passStatus"`
	RestrictedData meta.MetaData      `json:"restrictedData"`
	Student        studentDTO.Student `json:"student"`
	Score          pgtype.Int4        `json:"score"`
}

func GetAllCPPsForCoursePhaseDTOFromDBModel(model db.GetAllApplicationParticipationsRow) (ApplicationParticipation, error) {
	restrictedData, err := meta.GetMetaDataDTOFromDBModel(model.RestrictedData)
	if err != nil {
		log.Error("failed to create Application DTO from DB model")
		return ApplicationParticipation{}, err
	}

	return ApplicationParticipation{
		ID:             model.CoursePhaseParticipationID,
		PassStatus:     coursePhaseParticipationDTO.GetPassStatusString(model.PassStatus),
		RestrictedData: restrictedData,
		Student:        studentDTO.GetStudentDTOFromApplicationParticipation(model),
		Score:          model.Score,
	}, nil
}
