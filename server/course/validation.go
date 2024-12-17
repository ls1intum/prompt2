package course

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
	"github.com/niclasheun/prompt2.0/coursePhase"
	log "github.com/sirupsen/logrus"
)

func validateCreateCourse(c courseDTO.CreateCourse) error {
	if c.Name == "" {
		errorMessage := "course name is required"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}
	if !c.StartDate.Valid {
		errorMessage := "start date is required"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}
	if !c.EndDate.Valid {
		errorMessage := "end date is required"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}
	if c.StartDate.Time.After(c.EndDate.Time) {
		errorMessage := "start date must be before end date"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}
	if !c.SemesterTag.Valid || c.SemesterTag.String == "" {
		errorMessage := "semester tag is required"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}
	if c.CourseType == "" {
		errorMessage := "course type is required"
		log.Error(errorMessage)
		return errors.New(errorMessage)
	}

	return nil
}

func validateUpdateCourseOrder(ctx context.Context, courseID uuid.UUID, c []courseDTO.CoursePhaseGraph) error {
	// for each course phase check if the course id is the same
	for _, graphItem := range c {
		coursePhase, err := coursePhase.GetCoursePhaseByID(ctx, graphItem.ToCoursePhaseID)
		if err != nil {
			return err
		}
		if courseID != coursePhase.CourseID {
			errorMessage := "course id must be the same for all course phases"
			log.Error(errorMessage)
			return errors.New(errorMessage)
		}
	}

	return nil
}
