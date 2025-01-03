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
	ID         uuid.UUID          `json:"id"`
	PassStatus string             `json:"pass_status"`
	MetaData   meta.MetaData      `json:"meta_data"`
	Student    studentDTO.Student `json:"student"`
	Score      pgtype.Int4        `json:"score"`
}

func GetAllCPPsForCoursePhaseDTOFromDBModel(model db.GetAllApplicationParticipationsRow) (ApplicationParticipation, error) {
	metaData, err := meta.GetMetaDataDTOFromDBModel(model.MetaData)
	if err != nil {
		log.Error("failed to create Application DTO from DB model")
		return ApplicationParticipation{}, err
	}

	return ApplicationParticipation{
		ID:         model.CoursePhaseParticipationID,
		PassStatus: coursePhaseParticipationDTO.GetPassStatusString(model.PassStatus),
		MetaData:   metaData,
		Student: studentDTO.GetStudentDTOFromDBModel(db.Student{
			ID:                   model.StudentID,
			FirstName:            model.FirstName,
			LastName:             model.LastName,
			Email:                model.Email,
			MatriculationNumber:  model.MatriculationNumber,
			UniversityLogin:      model.UniversityLogin,
			HasUniversityAccount: model.HasUniversityAccount,
			Gender:               model.Gender,
		}),
		Score: model.Score,
	}, nil
}
