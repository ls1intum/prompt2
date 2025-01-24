package applicationDTO

import (
	"github.com/niclasheun/prompt2.0/student/studentDTO"
)

type StatusEnum string

const (
	StatusNotApplied StatusEnum = "not_applied"
	StatusApplied    StatusEnum = "applied"
	StatusNewUser    StatusEnum = "new_user"
)

type Application struct {
	Status             StatusEnum          `json:"status"`
	Student            *studentDTO.Student `json:"student"`
	AnswersText        []AnswerText        `json:"answersText"`
	AnswersMultiSelect []AnswerMultiSelect `json:"answersMultiSelect"`
}
