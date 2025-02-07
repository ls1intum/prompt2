package courseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type GetOwnCourseParticipation struct {
	IsStudentOfCourse  bool        `json:"isStudentOfCourse"`
	ID                 uuid.UUID   `json:"id"`
	CourseID           uuid.UUID   `json:"courseID"`
	StudentID          uuid.UUID   `json:"studentID"`
	ActiveCoursePhases []uuid.UUID `json:"activeCoursePhases"`
}

func GetOwnCourseParticipationDTOFromDBModel(model db.GetCourseParticipationByCourseIDAndMatriculationRow) GetOwnCourseParticipation {
	return GetOwnCourseParticipation{
		IsStudentOfCourse:  model.StudentID != uuid.Nil,
		ID:                 model.ID,
		CourseID:           model.CourseID,
		StudentID:          model.StudentID,
		ActiveCoursePhases: model.ActiveCoursePhases,
	}
}
