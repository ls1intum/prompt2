package courseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CreateCourseParticipation struct {
	CourseID  uuid.UUID `json:"course_id"`
	StudentID uuid.UUID `json:"student_id"`
}

func (c CreateCourseParticipation) GetDBModel() db.CreateCourseParticipationParams {
	return db.CreateCourseParticipationParams{
		CourseID:  c.CourseID,
		StudentID: c.StudentID,
	}
}
