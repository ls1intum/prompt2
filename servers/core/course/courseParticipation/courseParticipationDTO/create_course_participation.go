package courseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
)

type CreateCourseParticipation struct {
	CourseID  uuid.UUID `json:"courseID"`
	StudentID uuid.UUID `json:"studentID"`
}

func (c CreateCourseParticipation) GetDBModel() db.CreateCourseParticipationParams {
	return db.CreateCourseParticipationParams{
		CourseID:  c.CourseID,
		StudentID: c.StudentID,
	}
}
