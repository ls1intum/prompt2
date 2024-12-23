package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CreateQuestionMultiSelect struct {
	CoursePhaseID uuid.UUID `json:"course_phase_id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	Placeholder   string    `json:"placeholder"`
	ErrorMessage  string    `json:"error_message"`
	IsRequired    bool      `json:"is_required"`
	MinSelect     int       `json:"min_select"`
	MaxSelect     int       `json:"max_select"`
	Options       []string  `json:"options"`
	OrderNum      int       `json:"order_num"`
}

func (a CreateQuestionMultiSelect) GetDBModel() db.CreateApplicationQuestionMultiSelectParams {
	return db.CreateApplicationQuestionMultiSelectParams{
		CoursePhaseID: a.CoursePhaseID,
		Title:         pgtype.Text{String: a.Title, Valid: true},
		Description:   pgtype.Text{String: a.Description, Valid: true},
		Placeholder:   pgtype.Text{String: a.Placeholder, Valid: true},
		ErrorMessage:  pgtype.Text{String: a.ErrorMessage, Valid: true},
		IsRequired:    pgtype.Bool{Bool: a.IsRequired, Valid: true},
		MinSelect:     pgtype.Int4{Int32: int32(a.MinSelect), Valid: true},
		MaxSelect:     pgtype.Int4{Int32: int32(a.MaxSelect), Valid: true},
		Options:       a.Options,
		OrderNum:      pgtype.Int4{Int32: int32(a.OrderNum), Valid: true},
	}

}
