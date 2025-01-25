package courseDTO

import (
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type UpdateCourseData struct {
	MetaData meta.MetaData `json:"metaData"`
}

func (c UpdateCourseData) GetDBModel() (db.UpdateCourseParams, error) {
	metaData, err := c.MetaData.GetDBModel()
	if err != nil {
		log.Error("failed to create Course DTO from DB model")
		return db.UpdateCourseParams{}, err
	}

	return db.UpdateCourseParams{
		MetaData: metaData,
	}, nil
}
