package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/student/studentDTO"
)

type StatusEnum string

const (
	StatusNotApplied StatusEnum = "not_applied"
	StatusApplied    StatusEnum = "applied"
	StatusNewUser    StatusEnum = "new_user"
)

type Application struct {
	ID                 uuid.UUID           `json:"id"`
	Status             StatusEnum          `json:"status"`
	Student            *studentDTO.Student `json:"student"`
	AnswersText        []AnswerText        `json:"answersText"`
	AnswersMultiSelect []AnswerMultiSelect `json:"answersMultiSelect"`
	AnswersFileUpload  []AnswerFileUpload  `json:"answersFileUpload"`
}
