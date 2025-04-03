package developerProfileDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

type DeveloperProfile struct {
	CoursePhaseID         uuid.UUID   `json:"coursePhaseID"`
	CourseParticipationID uuid.UUID   `json:"courseParticipationID"`
	AppleID               string      `json:"appleID"`
	GitLabUsername        string      `json:"gitLabUsername"`
	HasMacBook            bool        `json:"hasMacBook"`
	IPhoneUUID            pgtype.UUID `json:"iPhoneUUID"`
	IPadUUID              pgtype.UUID `json:"iPadUUID"`
	AppleWatchUUID        pgtype.UUID `json:"appleWatchUUID"`
}

func GetDeveloperProfileDTOFromDBModel(model db.DeveloperProfile) DeveloperProfile {
	return DeveloperProfile{
		CoursePhaseID:         model.CoursePhaseID,
		CourseParticipationID: model.CourseParticipationID,
		AppleID:               model.AppleID,
		GitLabUsername:        model.GitlabUsername,
		HasMacBook:            model.HasMacbook,
		IPhoneUUID:            model.IphoneUuid,
		IPadUUID:              model.IpadUuid,
		AppleWatchUUID:        model.AppleWatchUuid,
	}
}

func GetDeveloperProfileDTOsFromDBModels(models []db.DeveloperProfile) []DeveloperProfile {
	developerProfiles := make([]DeveloperProfile, 0, len(models))
	for _, model := range models {
		developerProfiles = append(developerProfiles, GetDeveloperProfileDTOFromDBModel(model))
	}
	return developerProfiles
}
