package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ls1intum/prompt2/servers/core/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/meta"
	"github.com/ls1intum/prompt2/servers/core/student/studentDTO"
	log "github.com/sirupsen/logrus"
)

type ApplicationParticipation struct {
	CoursePhaseID         uuid.UUID          `json:"coursePhaseID"`
	CourseParticipationID uuid.UUID          `json:"courseParticipationID"`
	PassStatus            string             `json:"passStatus"`
	RestrictedData        meta.MetaData      `json:"restrictedData"`
	Student               studentDTO.Student `json:"student"`
	Score                 pgtype.Int4        `json:"score" swaggertype:"integer"`
}

func GetAllCPPsForCoursePhaseDTOFromDBModel(model db.GetAllApplicationParticipationsRow) (ApplicationParticipation, error) {
	restrictedData, err := meta.GetMetaDataDTOFromDBModel(model.RestrictedData)
	if err != nil {
		log.Error("failed to create Application DTO from DB model")
		return ApplicationParticipation{}, err
	}

	return ApplicationParticipation{
		CoursePhaseID:         model.CoursePhaseID,
		CourseParticipationID: model.CourseParticipationID,
		PassStatus:            coursePhaseParticipationDTO.GetPassStatusString(model.PassStatus),
		RestrictedData:        restrictedData,
		Student:               studentDTO.GetStudentDTOFromApplicationParticipation(model),
		Score:                 model.Score,
	}, nil
}
