package coursePhaseDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type UpdateCoursePhase struct {
	ID             uuid.UUID     `json:"id"`
	Name           string        `json:"name"`
	IsInitialPhase bool          `json:"is_initial_phase"`
	MetaData       meta.MetaData `json:"meta_data"`
}

func (cp UpdateCoursePhase) GetDBModel() (db.UpdateCoursePhaseParams, error) {
	metaData, err := cp.MetaData.GetDBModel()
	if err != nil {
		return db.UpdateCoursePhaseParams{}, err
	}
	return db.UpdateCoursePhaseParams{
		ID:             cp.ID,
		Name:           pgtype.Text{String: cp.Name, Valid: true},
		IsInitialPhase: cp.IsInitialPhase,
		MetaData:       metaData,
	}, nil
}
