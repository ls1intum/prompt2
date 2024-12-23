package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CreateQuestionText struct {
	CoursePhaseID   uuid.UUID `json:"course_phase_id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Placeholder     string    `json:"placeholder"`
	ValidationRegex string    `json:"validation_regex"`
	ErrorMessage    string    `json:"error_message"`
	IsRequired      bool      `json:"is_required"`
	AllowedLength   int       `json:"allowed_length"`
	OrderNum        int       `json:"order_num"`
}

func (a CreateQuestionText) GetDBModel() db.CreateApplicationQuestionTextParams {
	return db.CreateApplicationQuestionTextParams{
		CoursePhaseID:   a.CoursePhaseID,
		Title:           pgtype.Text{String: a.Title, Valid: true},
		Description:     pgtype.Text{String: a.Description, Valid: true},
		Placeholder:     pgtype.Text{String: a.Placeholder, Valid: true},
		ValidationRegex: pgtype.Text{String: a.ValidationRegex, Valid: true},
		ErrorMessage:    pgtype.Text{String: a.ErrorMessage, Valid: true},
		IsRequired:      pgtype.Bool{Bool: a.IsRequired, Valid: true},
		AllowedLength:   pgtype.Int4{Int32: int32(a.AllowedLength), Valid: true},
		OrderNum:        pgtype.Int4{Int32: int32(a.OrderNum), Valid: true},
	}
}
