package courseParticipation

import (
	"errors"

	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/course/courseParticipation/courseParticipationDTO"
	log "github.com/sirupsen/logrus"
)

func Validate(c courseParticipationDTO.CreateCourseParticipation) error {
	if c.CourseID == uuid.Nil {
		errorMessage := "validation error: course id is required"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}
	if c.StudentID == uuid.Nil {
		errorMessage := "validation error: student id is required"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}

	return nil
}
