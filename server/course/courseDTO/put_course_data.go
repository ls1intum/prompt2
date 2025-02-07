package courseDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type UpdateCourseData struct {
	StartDate           pgtype.Date   `json:"startDate"`
	EndDate             pgtype.Date   `json:"endDate"`
	Ects                pgtype.Int4   `json:"ects"`
	CourseType          pgtype.Text   `json:"courseType"`
	RestrictedData      meta.MetaData `json:"restrictedData"`
	StudentReadableData meta.MetaData `json:"studentReadableData"`
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

	var nullCourseType db.NullCourseType
	if c.CourseType.Valid {
		courseType := db.CourseType(c.CourseType.String)

		nullCourseType = db.NullCourseType{
			CourseType: courseType,
			Valid:      true,
		}
	} else {
		nullCourseType = db.NullCourseType{
			Valid: false,
		}
	}

	return db.UpdateCourseParams{
		RestrictedData:      restrictedData,
		StudentReadableData: studentReadableData,
		StartDate:           c.StartDate,
		EndDate:             c.EndDate,
		Ects:                c.Ects,
		CourseType:          nullCourseType,
	}, nil
}
