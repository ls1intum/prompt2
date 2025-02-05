package courseDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type UpdateCourseData struct {
	StartDate           pgtype.Date       `json:"startDate"`
	EndDate             pgtype.Date       `json:"endDate"`
	Ects                pgtype.Int4       `json:"ects"`
	CourseType          db.NullCourseType `json:"courseType"`
	RestrictedData      meta.MetaData     `json:"restrictedData"`
	StudentReadableData meta.MetaData     `json:"studentReadableData"`
}

func (c UpdateCourseData) GetDBModel() (db.UpdateCourseParams, error) {
	restrictedData, err := c.RestrictedData.GetDBModel()
	if err != nil {
		log.Error("failed to create Course DTO from DB model")
		return db.UpdateCourseParams{}, err
	}

	studentReadableData, err := c.StudentReadableData.GetDBModel()
	if err != nil {
		log.Error("failed to create Course DTO from DB model")
		return db.UpdateCourseParams{}, err
	}

	return db.UpdateCourseParams{
		RestrictedData:      restrictedData,
		StudentReadableData: studentReadableData,
		StartDate:           c.StartDate,
		EndDate:             c.EndDate,
		Ects:                c.Ects,
		CourseType:          c.CourseType,
	}, nil
}
