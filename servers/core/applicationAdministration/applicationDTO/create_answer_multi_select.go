package applicationDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
)

type CreateAnswerMultiSelect struct {
	ApplicationQuestionID uuid.UUID `json:"applicationQuestionID"`
	Answer                []string  `json:"answer"`
}

func (a CreateAnswerMultiSelect) GetDBModel() db.CreateApplicationAnswerMultiSelectParams {
	return db.CreateApplicationAnswerMultiSelectParams{
		ApplicationQuestionID: a.ApplicationQuestionID,
		Answer:                a.Answer,
	}
}
