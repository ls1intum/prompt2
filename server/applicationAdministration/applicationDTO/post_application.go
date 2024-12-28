package applicationDTO

import (
	"github.com/niclasheun/prompt2.0/student/studentDTO"
)

type PostApplication struct {
	Student            studentDTO.CreateStudent  `json:"student"` // should be able to handle either a new student or an existing dependent on ID
	AnswersText        []CreateAnswerText        `json:"answers_text"`
	AnswersMultiSelect []CreateAnswerMultiSelect `json:"answers_multi_select"`
}
