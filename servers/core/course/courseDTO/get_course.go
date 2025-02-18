package courseDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type Course struct {
	ID                  uuid.UUID     `json:"id"`
	Name                string        `json:"name"`
	StartDate           pgtype.Date   `json:"startDate"`
	EndDate             pgtype.Date   `json:"endDate"`
	SemesterTag         pgtype.Text   `json:"semesterTag"`
	Ects                pgtype.Int4   `json:"ects"`
	CourseType          string        `json:"courseType"`
	RestrictedData      meta.MetaData `json:"restrictedData"`
	StudentReadableData meta.MetaData `json:"studentReadableData"`
}

func GetCourseDTOFromDBModel(model db.Course) (Course, error) {
	restrictedData, err := meta.GetMetaDataDTOFromDBModel(model.RestrictedData)
	if err != nil {
		log.Error("failed to create Course DTO from DB model")
		return Course{}, err
	}

	studentReadableData, err := meta.GetMetaDataDTOFromDBModel(model.StudentReadableData)
	if err != nil {
		log.Error("failed to create Course DTO from DB model")
		return Course{}, err
	}

	return Course{
		ID:                  model.ID,
		Name:                model.Name,
		StartDate:           model.StartDate,
		EndDate:             model.EndDate,
		SemesterTag:         model.SemesterTag,
		Ects:                model.Ects,
		CourseType:          string(model.CourseType),
		RestrictedData:      restrictedData,
		StudentReadableData: studentReadableData,
	}, nil
}
