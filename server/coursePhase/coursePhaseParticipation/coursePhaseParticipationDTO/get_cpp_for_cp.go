package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/student/studentDTO"
	log "github.com/sirupsen/logrus"
)

type GetAllCPPsForCoursePhase struct {
	ID         uuid.UUID          `json:"id"`
	PassStatus string             `json:"passed_status"`
	MetaData   meta.MetaData      `json:"meta_data"`
	Student    studentDTO.Student `json:"student"`
}

func GetAllCPPsForCoursePhaseDTOFromDBModel(model db.GetAllCoursePhaseParticipationsForCoursePhaseRow) (GetAllCPPsForCoursePhase, error) {
	metaData, err := meta.GetMetaDataDTOFromDBModel(model.MetaData)
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DTO from DB model")
		return GetAllCPPsForCoursePhase{}, err
	}

	return GetAllCPPsForCoursePhase{
		ID:         model.CoursePhaseParticipationID,
		PassStatus: getPassStatusString(model.PassStatus),
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
	}, nil
}
