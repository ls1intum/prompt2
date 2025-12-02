package courseDTO

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/coursePhase/coursePhaseDTO"
	"github.com/ls1intum/prompt2/servers/core/meta"
	log "github.com/sirupsen/logrus"
)

type CourseWithPhases struct {
	ID                  uuid.UUID                          `json:"id"`
	Name                string                             `json:"name"`
	StartDate           pgtype.Date                        `json:"startDate" swaggertype:"string"`
	EndDate             pgtype.Date                        `json:"endDate" swaggertype:"string"`
	SemesterTag         pgtype.Text                        `json:"semesterTag" swaggertype:"string"`
	Ects                pgtype.Int4                        `json:"ects" swaggertype:"integer"`
	CourseType          string                             `json:"courseType"`
	RestrictedData      meta.MetaData                      `json:"restrictedData"`
	StudentReadableData meta.MetaData                      `json:"studentReadableData"`
	Template            bool                               `json:"template"`
	Archived            bool                               `json:"archived"`
	ArchivedOn          *time.Time                         `json:"archivedOn,omitempty"`
	CoursePhases        []coursePhaseDTO.CoursePhaseSequence `json:"coursePhases"`
}

// This only maps the base course; CoursePhases is filled in the service.
func GetCourseWithPhasesDTOFromDBModel(model db.Course) (CourseWithPhases, error) {
	restrictedData, err := meta.GetMetaDataDTOFromDBModel(model.RestrictedData)
	if err != nil {
		log.Error("failed to create CourseWithPhases DTO from DB model")
		return CourseWithPhases{}, err
	}

	studentReadableData, err := meta.GetMetaDataDTOFromDBModel(model.StudentReadableData)
	if err != nil {
		log.Error("failed to create CourseWithPhases DTO from DB model")
		return CourseWithPhases{}, err
	}

	dto := CourseWithPhases{
		ID:                  model.ID,
		Name:                model.Name,
		StartDate:           model.StartDate,
		EndDate:             model.EndDate,
		SemesterTag:         model.SemesterTag,
		Ects:                model.Ects,
		CourseType:          string(model.CourseType),
		RestrictedData:      restrictedData,
		StudentReadableData: studentReadableData,
		Template:            model.Template,
		Archived:            model.Archived,
	}

	if model.ArchivedOn.Valid {
		t := model.ArchivedOn.Time
		dto.ArchivedOn = &t
	}

	return dto, nil
}
