package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type AnswerText struct {
	ID                         uuid.UUID `json:"id"`
	ApplicationQuestionID      uuid.UUID `json:"application_question_id"`
	CoursePhaseParticipationID uuid.UUID `json:"course_phase_participation_id"`
	Answer                     string    `json:"answer"`
}

func (a AnswerText) GetDBModel() db.ApplicationAnswerText {
	return db.ApplicationAnswerText{
		ID:                         a.ID,
		ApplicationQuestionID:      a.ApplicationQuestionID,
		CoursePhaseParticipationID: a.CoursePhaseParticipationID,
		Answer:                     pgtype.Text{String: a.Answer, Valid: true},
	}
}

func GetAnswerTextDTOFromDBModel(answer db.ApplicationAnswerText) AnswerText {
	return AnswerText{
		ID:                         answer.ID,
		ApplicationQuestionID:      answer.ApplicationQuestionID,
		CoursePhaseParticipationID: answer.CoursePhaseParticipationID,
		Answer:                     answer.Answer.String,
	}
}
