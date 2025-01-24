package courseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type GetCourseParticipation struct {
	ID        uuid.UUID `json:"id"`
	CourseID  uuid.UUID `json:"courseID"`
	StudentID uuid.UUID `json:"studentID"`
}

func GetCourseParticipationDTOFromDBModel(model db.CourseParticipation) GetCourseParticipation {
	return GetCourseParticipation{
		ID:        model.ID,
		CourseID:  model.CourseID,
		StudentID: model.StudentID,
	}
}

func (c GetCourseParticipation) GetDBModel() db.CourseParticipation {
	return db.CourseParticipation{
		ID:        c.ID,
		CourseID:  c.CourseID,
		StudentID: c.StudentID,
	}
}
