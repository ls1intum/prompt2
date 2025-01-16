package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/student/studentDTO"
	log "github.com/sirupsen/logrus"
)

type GetAllCPPsForCoursePhase struct {
	ID           uuid.UUID          `json:"id"`
	PassStatus   string             `json:"pass_status"`
	MetaData     meta.MetaData      `json:"meta_data"`
	PrevMetaData meta.MetaData      `json:"prev_meta_data"`
	Student      studentDTO.Student `json:"student"`
}

func GetAllCPPsForCoursePhaseDTOFromDBModel(model db.GetAllCoursePhaseParticipationsForCoursePhaseIncludingPreviousRow) (GetAllCPPsForCoursePhase, error) {
	metaData, err := meta.GetMetaDataDTOFromDBModel(model.MetaData)
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DTO from DB model")
		return GetAllCPPsForCoursePhase{}, err
	}

	prevMetaData, err := meta.GetMetaDataDTOFromDBModel(model.PrevMetaData)
	if err != nil {
		log.Error("failed to create CoursePhaseParticipation DTO from DB model")
		return GetAllCPPsForCoursePhase{}, err
	}

	return GetAllCPPsForCoursePhase{
		ID:           model.CoursePhaseParticipationID,
		PassStatus:   GetPassStatusString(model.PassStatus),
		MetaData:     metaData,
		PrevMetaData: prevMetaData,
		Student: studentDTO.GetStudentDTOFromDBModel(db.Student{
			ID:                   model.StudentID,
			FirstName:            model.FirstName,
			LastName:             model.LastName,
			Email:                model.Email,
			MatriculationNumber:  model.MatriculationNumber,
			UniversityLogin:      model.UniversityLogin,
			HasUniversityAccount: model.HasUniversityAccount,
			Gender:               model.Gender,
			Nationality:          model.Nationality,
			StudyDegree:          model.StudyDegree,
			StudyProgram:         model.StudyProgram,
			CurrentSemester:      model.CurrentSemester,
		}),
	}, nil
}
