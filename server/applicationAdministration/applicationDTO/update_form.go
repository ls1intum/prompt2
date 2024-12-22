package applicationDTO

import (
	"github.com/google/uuid"
)

// TODO: What about deadlines, etc.? -> maybe in course phase meta data?! or extra table for it?
type UpdateForm struct {
	DeleteQuestionsText        []uuid.UUID                 `json:"delete_questions_text"`
	DeleteQuestionsMultiSelect []uuid.UUID                 `json:"delete_questions_multi_select"`
	CreateQuestionsText        []CreateQuestionText        `json:"create_questions_text"`
	CreateQuestionsMultiSelect []CreateQuestionMultiSelect `json:"create_questions_multi_select"`
	UpdateQuestionsText        []QuestionText              `json:"update_questions_text"`
	UpdateQuestionsMultiSelect []QuestionMultiSelect       `json:"update_questions_multi_select"`
}
