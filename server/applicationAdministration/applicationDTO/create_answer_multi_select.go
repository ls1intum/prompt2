package applicationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CreateAnswerMultiSelect struct {
	ApplicationQuestionID uuid.UUID `json:"application_question_id"`
	Answer                []string  `json:"answer"`
}

func (a CreateAnswerMultiSelect) GetDBModel() db.ApplicationAnswerMultiSelect {
	return db.ApplicationAnswerMultiSelect{
		ApplicationQuestionID: a.ApplicationQuestionID,
		Answer:                a.Answer,
	}
}
