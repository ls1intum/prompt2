package coursePhaseDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type UpdateCoursePhase struct {
	ID                  uuid.UUID     `json:"id"`
	Name                pgtype.Text   `json:"name"` // use pgtype to handle null values
	RestrictedData      meta.MetaData `json:"restrictedData"`
	StudentReadableData meta.MetaData `json:"studentReadableData"`
}

func (cp UpdateCoursePhase) GetDBModel() (db.UpdateCoursePhaseParams, error) {
	restrictedData, err := cp.RestrictedData.GetDBModel()
	if err != nil {
		return db.UpdateCoursePhaseParams{}, err
	}

	studentReadableData, err := cp.StudentReadableData.GetDBModel()
	if err != nil {
		return db.UpdateCoursePhaseParams{}, err
	}

	return db.UpdateCoursePhaseParams{
		ID:                  cp.ID,
		Name:                cp.Name,
		StudentReadableData: studentReadableData,
		RestrictedData:      restrictedData,
	}, nil
}
