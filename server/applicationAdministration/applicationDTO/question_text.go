package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type QuestionText struct {
	ID              uuid.UUID `json:"id"`
	CoursePhaseID   uuid.UUID `json:"course_phase_id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	Placeholder     string    `json:"placeholder"`
	ValidationRegex string    `json:"validation_regex"`
	ErrorMessage    string    `json:"error_message"`
	IsRequired      bool      `json:"is_required"`
	AllowedLength   int       `json:"allowed_length"`
	OrderNum        int       `json:"order_num"`
	// using pgtype as this allows for optional values
	AccessibleForOtherPhases pgtype.Bool `json:"accessible_for_other_phases"`
	AccessKey                pgtype.Text `json:"access"`
}

func (a QuestionText) GetDBModel() db.UpdateApplicationQuestionTextParams {
	return db.UpdateApplicationQuestionTextParams{
		ID:                       a.ID,
		Title:                    pgtype.Text{String: a.Title, Valid: true},
		Description:              pgtype.Text{String: a.Description, Valid: true},
		Placeholder:              pgtype.Text{String: a.Placeholder, Valid: true},
		ValidationRegex:          pgtype.Text{String: a.ValidationRegex, Valid: true},
		ErrorMessage:             pgtype.Text{String: a.ErrorMessage, Valid: true},
		IsRequired:               pgtype.Bool{Bool: a.IsRequired, Valid: true},
		AllowedLength:            pgtype.Int4{Int32: int32(a.AllowedLength), Valid: true},
		OrderNum:                 pgtype.Int4{Int32: int32(a.OrderNum), Valid: true},
		AccessibleForOtherPhases: a.AccessibleForOtherPhases,
		AccessKey:                a.AccessKey,
	}
}

func GetQuestionTextDTOFromDBModel(applicationQuestionText db.ApplicationQuestionText) QuestionText {
	return QuestionText{
		ID:                       applicationQuestionText.ID,
		CoursePhaseID:            applicationQuestionText.CoursePhaseID,
		Title:                    applicationQuestionText.Title.String,
		Description:              applicationQuestionText.Description.String,
		Placeholder:              applicationQuestionText.Placeholder.String,
		ValidationRegex:          applicationQuestionText.ValidationRegex.String,
		ErrorMessage:             applicationQuestionText.ErrorMessage.String,
		IsRequired:               applicationQuestionText.IsRequired.Bool,
		AllowedLength:            int(applicationQuestionText.AllowedLength.Int32),
		OrderNum:                 int(applicationQuestionText.OrderNum.Int32),
		AccessibleForOtherPhases: applicationQuestionText.AccessibleForOtherPhases,
		AccessKey:                applicationQuestionText.AccessKey,
	}
}
