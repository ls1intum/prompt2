package applicationDTO

import db "github.com/niclasheun/prompt2.0/db/sqlc"

// TODO: What about deadlines, etc.? -> maybe in course phase meta data?! or extra table for it?
type Form struct {
	QuestionsText        []QuestionText        `json:"questions_text"`
	QuestionsMultiSelect []QuestionMultiSelect `json:"questions_multi_select"`
}

func GetFormDTOFromDBModel(questionsText []db.ApplicationQuestionText, questionsMultiSelect []db.ApplicationQuestionMultiSelect) Form {
	applicationFormDTO := Form{
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