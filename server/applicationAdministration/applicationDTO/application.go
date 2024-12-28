package applicationDTO

import (
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/student/studentDTO"
)

type Application struct {
	Student            studentDTO.Student  `json:"student"` // should be able to handle either a new student or an existing dependent on ID
	AnswersText        []AnswerText        `json:"answers_text"`
	AnswersMultiSelect []AnswerMultiSelect `json:"answers_multi_select"`
}

func (a Application) GetDBModel() (db.Student, []db.ApplicationAnswerText, []db.ApplicationAnswerMultiSelect) {
	student := a.Student.GetDBModel()
	answersText := make([]db.ApplicationAnswerText, 0, len(a.AnswersText))
	answersMultiSelect := make([]db.ApplicationAnswerMultiSelect, 0, len(a.AnswersMultiSelect))

	for _, answer := range a.AnswersText {
		answersText = append(answersText, answer.GetDBModel())
	}

	for _, answer := range a.AnswersMultiSelect {
		answersMultiSelect = append(answersMultiSelect, answer.GetDBModel())
	}

	return student, answersText, answersMultiSelect
}

func GetApplicationDTOFromDBModel(student db.Student, answersText []db.ApplicationAnswerText, answersMultiSelect []db.ApplicationAnswerMultiSelect) Application {
	applicationDTO := Application{
		Student:            studentDTO.GetStudentDTOFromDBModel(student),
		AnswersText:        make([]AnswerText, 0, len(answersText)),
		AnswersMultiSelect: make([]AnswerMultiSelect, 0, len(answersMultiSelect)),
	}

	for _, answer := range answersText {
		applicationDTO.AnswersText = append(applicationDTO.AnswersText, GetAnswerTextDTOFromDBModel(answer))
	}

	for _, answer := range answersMultiSelect {
		applicationDTO.AnswersMultiSelect = append(applicationDTO.AnswersMultiSelect, GetAnswerMultiSelectDTOFromDBModel(answer))
	}

	return applicationDTO
}
