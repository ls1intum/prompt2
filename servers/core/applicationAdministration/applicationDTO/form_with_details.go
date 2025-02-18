package applicationDTO

import db "github.com/niclasheun/prompt2.0/db/sqlc"

type FormWithDetails struct {
	ApplicationPhase     OpenApplication       `json:"applicationPhase"`
	QuestionsText        []QuestionText        `json:"questionsText"`
	QuestionsMultiSelect []QuestionMultiSelect `json:"questionsMultiSelect"`
}

func GetFormWithDetailsDTOFromDBModel(applicationPhase db.GetOpenApplicationPhaseRow, questionsText []db.ApplicationQuestionText, questionsMultiSelect []db.ApplicationQuestionMultiSelect) FormWithDetails {
	applicationPhaseDTO := OpenApplication{
		CourseName:               applicationPhase.CourseName,
		CoursePhaseID:            applicationPhase.CoursePhaseID,
		CourseType:               string(applicationPhase.CourseType),
		ECTS:                     int(applicationPhase.Ects.Int32),
		StartDate:                applicationPhase.StartDate,
		EndDate:                  applicationPhase.EndDate,
		ApplicationDeadline:      applicationPhase.ApplicationEndDate,
		ExternalStudentsAllowed:  applicationPhase.ExternalStudentsAllowed,
		UniversityLoginAvailable: applicationPhase.UniversityLoginAvailable,
	}

	applicationFormDTO := FormWithDetails{
		ApplicationPhase:     applicationPhaseDTO,
		QuestionsText:        make([]QuestionText, 0, len(questionsText)),
		QuestionsMultiSelect: make([]QuestionMultiSelect, 0, len(questionsMultiSelect)),
	}

	for _, question := range questionsText {
		applicationFormDTO.QuestionsText = append(applicationFormDTO.QuestionsText, GetQuestionTextDTOFromDBModel(question))
	}

	for _, question := range questionsMultiSelect {
		applicationFormDTO.QuestionsMultiSelect = append(applicationFormDTO.QuestionsMultiSelect, GetQuestionMultiSelectDTOFromDBModel(question))
	}

	return applicationFormDTO
}
