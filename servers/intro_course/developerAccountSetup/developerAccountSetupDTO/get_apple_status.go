package developerAccountSetupDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

type AppleStatus struct {
	CoursePhaseID         uuid.UUID        `json:"coursePhaseID"`
	CourseParticipationID uuid.UUID        `json:"courseParticipationID"`
	GitlabSuccess         bool             `json:"gitlabSuccess"`
	ErrorMessage          string           `json:"errorMessage"`
	CreatedAt             pgtype.Timestamp `json:"createdAt"`
	UpdatedAt             pgtype.Timestamp `json:"updatedAt"`
}

func getAppleStatusDTOFromModel(model db.StudentAppleProcess) AppleStatus {
	return AppleStatus{
		CoursePhaseID:         model.CoursePhaseID,
		CourseParticipationID: model.CourseParticipationID,
		GitlabSuccess:         model.AppleSuccess,
		ErrorMessage:          model.ErrorMessage.String,
		CreatedAt:             model.CreatedAt,
		UpdatedAt:             model.UpdatedAt,
	}
}

func GetAppleStatusDTOsFromModels(models []db.StudentAppleProcess) []AppleStatus {
	dtos := make([]AppleStatus, 0, len(models))
	for _, model := range models {
		dtos = append(dtos, getAppleStatusDTOFromModel(model))
	}
	return dtos
}
