package courseDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type CreateCourse struct {
	Name        string        `json:"name"`
	StartDate   pgtype.Date   `json:"startDate"`
	EndDate     pgtype.Date   `json:"endDate"`
	SemesterTag pgtype.Text   `json:"semesterTag"`
	MetaData    meta.MetaData `json:"metaData"`
	CourseType  db.CourseType `json:"courseType"`
	Ects        pgtype.Int4   `json:"ects"`
}

func (c CreateCourse) GetDBModel() (db.CreateCourseParams, error) {
	metaData, err := c.MetaData.GetDBModel()
	if err != nil {
		log.Error("failed to create Course DTO from DB model")
		return db.CreateCourseParams{}, err
	}

	return db.CreateCourseParams{
		Name:        c.Name,
		StartDate:   c.StartDate,
		EndDate:     c.EndDate,
		SemesterTag: c.SemesterTag,
		MetaData:    metaData,
		CourseType:  c.CourseType,
		Ects:        c.Ects,
	}, nil
}
