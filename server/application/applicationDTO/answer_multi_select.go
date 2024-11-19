package applicationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type AnswerMultiSelect struct {
	ID                         uuid.UUID `json:"id"`
	ApplicationQuestionID      uuid.UUID `json:"application_question_id"`
	CoursePhaseParticipationID uuid.UUID `json:"course_phase_participation_id"`
	Answer                     []string  `json:"answer"`
}

func (a AnswerMultiSelect) GetDBModel() db.ApplicationAnswerMultiSelect {
	return db.ApplicationAnswerMultiSelect{
		ID:                         a.ID,
		ApplicationQuestionID:      a.ApplicationQuestionID,
		CoursePhaseParticipationID: a.CoursePhaseParticipationID,
		Answer:                     a.Answer,
	}
}

func GetAnswerMultiSelectDTOFromDBModel(answer db.ApplicationAnswerMultiSelect) AnswerMultiSelect {
	return AnswerMultiSelect{
		ID:                         answer.ID,
		ApplicationQuestionID:      answer.ApplicationQuestionID,
		CoursePhaseParticipationID: answer.CoursePhaseParticipationID,
		Answer:                     answer.Answer,
	}
}
