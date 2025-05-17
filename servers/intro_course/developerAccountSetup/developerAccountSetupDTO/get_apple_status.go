package developerAccountSetupDTO

import (
	"time"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

type AppleStatus struct {
	CoursePhaseID         uuid.UUID `json:"coursePhaseID"`
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
	AppleSuccess          bool      `json:"appleSuccess"`
	ErrorMessage          string    `json:"errorMessage"`
	CreatedAt             time.Time `json:"createdAt"`
	UpdatedAt             time.Time `json:"updatedAt"`
}

func getAppleStatusDTOFromModel(model db.StudentAppleProcess) AppleStatus {
	return AppleStatus{
		CoursePhaseID:         model.CoursePhaseID,
		CourseParticipationID: model.CourseParticipationID,
		AppleSuccess:          model.AppleSuccess,
		ErrorMessage:          model.ErrorMessage.String,
		CreatedAt:             model.CreatedAt.Time,
		UpdatedAt:             model.UpdatedAt.Time,
	}
}

func GetAppleStatusDTOsFromModels(models []db.StudentAppleProcess) []AppleStatus {
	dtos := make([]AppleStatus, 0, len(models))
	for _, model := range models {
		dtos = append(dtos, getAppleStatusDTOFromModel(model))
	}
	return dtos
}
