package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CreateAnswerText struct {
	ApplicationQuestionID uuid.UUID `json:"application_question_id"`
	Answer                string    `json:"answer"`
}

func (a CreateAnswerText) GetDBModel() db.ApplicationAnswerText {
	return db.ApplicationAnswerText{
		ApplicationQuestionID: a.ApplicationQuestionID,
		Answer:                pgtype.Text{String: a.Answer, Valid: true},
	}
}
