package applicationDTO

import (
	"github.com/google/uuid"
)

// TODO: What about deadlines, etc.? -> maybe in course phase meta data?! or extra table for it?
type UpdateForm struct {
	DeleteQuestionsText        []uuid.UUID                 `json:"deleteQuestionsText"`
	DeleteQuestionsMultiSelect []uuid.UUID                 `json:"deleteQuestionsMultiSelect"`
	CreateQuestionsText        []CreateQuestionText        `json:"createQuestionsText"`
	CreateQuestionsMultiSelect []CreateQuestionMultiSelect `json:"createQuestionsMultiSelect"`
	UpdateQuestionsText        []QuestionText              `json:"updateQuestionsText"`
	UpdateQuestionsMultiSelect []QuestionMultiSelect       `json:"updateQuestionsMultiSelect"`
}
