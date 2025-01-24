package coursePhaseDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type CreateCoursePhase struct {
	CourseID          uuid.UUID     `json:"courseID"`
	Name              string        `json:"name"`
	IsInitialPhase    bool          `json:"isInitialPhase"`
	MetaData          meta.MetaData `json:"metaData"`
	CoursePhaseTypeID uuid.UUID     `json:"coursePhaseTypeID"`
}

func (cp CreateCoursePhase) GetDBModel() (db.CreateCoursePhaseParams, error) {
	metaData, err := cp.MetaData.GetDBModel()
	if err != nil {
		return db.CreateCoursePhaseParams{}, err
	}
	return db.CreateCoursePhaseParams{
		CourseID:          cp.CourseID,
		Name:              pgtype.Text{String: cp.Name, Valid: true},
		IsInitialPhase:    cp.IsInitialPhase,
		MetaData:          metaData,
		CoursePhaseTypeID: cp.CoursePhaseTypeID,
	}, nil
}
