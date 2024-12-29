package courseDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type CreateCourse struct {
	Name        string        `json:"name"`
	StartDate   pgtype.Date   `json:"start_date"`
	EndDate     pgtype.Date   `json:"end_date"`
	SemesterTag pgtype.Text   `json:"semester_tag"`
	MetaData    meta.MetaData `json:"meta_data"`
	CourseType  db.CourseType `json:"course_type"`
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
