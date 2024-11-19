package coursePhase

import (
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func validateCreateCoursePhase(coursePhase coursePhaseDTO.CreateCoursePhase) error {
	if coursePhase.Name == "" {
		errorMessage := "course phase name is required"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}

	if coursePhase.CourseID == uuid.Nil {
		errorMessage := "course id is required"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}
	return nil
}

func validateUpdateCoursePhase(coursePhase coursePhaseDTO.UpdateCoursePhase) error {
	if coursePhase.Name == "" {
		errorMessage := "course phase name is required"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}

	return nil
}
