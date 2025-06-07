package courseDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ls1intum/prompt2/servers/core/coursePhase/coursePhaseDTO"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/meta"
	log "github.com/sirupsen/logrus"
)

type CourseWithPhases struct {
	ID                  uuid.UUID                            `json:"id"`
	Name                string                               `json:"name"`
	StartDate           pgtype.Date                          `json:"startDate" swaggertype:"string"`
	EndDate             pgtype.Date                          `json:"endDate" swaggertype:"string"`
	SemesterTag         string                               `json:"semesterTag"`
	CourseType          db.CourseType                        `json:"courseType"`
	ECTS                int                                  `json:"ects"`
	RestrictedData      meta.MetaData                        `json:"restrictedData"`
	StudentReadableData meta.MetaData                        `json:"studentReadableData"`
	CoursePhases        []coursePhaseDTO.CoursePhaseSequence `json:"coursePhases"`
}

func GetCourseWithPhasesDTOFromDBModel(course db.Course) (CourseWithPhases, error) {
	restrictedData, err := meta.GetMetaDataDTOFromDBModel(course.RestrictedData)
	if err != nil {
		log.Error("failed to create Course DTO from DB model")
		return CourseWithPhases{}, err
	}

	studentReadableData, err := meta.GetMetaDataDTOFromDBModel(course.StudentReadableData)
	if err != nil {
		log.Error("failed to create Course DTO from DB model")
		return CourseWithPhases{}, err
	}

	return CourseWithPhases{
		ID:                  course.ID,
		Name:                course.Name,
		StartDate:           course.StartDate,
		EndDate:             course.EndDate,
		SemesterTag:         course.SemesterTag.String,
		CourseType:          course.CourseType,
		ECTS:                int(course.Ects.Int32),
		RestrictedData:      restrictedData,
		StudentReadableData: studentReadableData,
		CoursePhases:        []coursePhaseDTO.CoursePhaseSequence{},
	}, nil
}
