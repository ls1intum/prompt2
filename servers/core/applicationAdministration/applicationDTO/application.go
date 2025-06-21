package applicationDTO

import (
	"github.com/ls1intum/prompt2/servers/core/student/studentDTO"
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
