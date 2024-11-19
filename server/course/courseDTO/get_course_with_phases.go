package courseDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type CourseWithPhases struct {
	ID           uuid.UUID                            `json:"id"`
	Name         string                               `json:"name"`
	StartDate    pgtype.Date                          `json:"start_date"`
	EndDate      pgtype.Date                          `json:"end_date"`
	SemesterTag  pgtype.Text                          `json:"semester_tag"`
	MetaData     meta.MetaData                        `json:"meta_data"`
	CoursePhases []coursePhaseDTO.CoursePhaseSequence `json:"course_phases"`
}

func GetCourseByIDFromDBModel(course db.Course) (CourseWithPhases, error) {
	metaData, err := meta.GetMetaDataDTOFromDBModel(course.MetaData)
	if err != nil {
		log.Error("failed to create Course DTO from DB model")
		return CourseWithPhases{}, err
	}

	// todo also pass the course phases here

	return CourseWithPhases{
		ID:           course.ID,
		Name:         course.Name,
		StartDate:    course.StartDate,
		EndDate:      course.EndDate,
		SemesterTag:  course.SemesterTag,
		MetaData:     metaData,
		CoursePhases: []coursePhaseDTO.CoursePhaseSequence{},
	}, nil
}
