package developerProfileDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

type PostDeveloperProfile struct {
	AppleID        string      `json:"appleID"`
	GitLabUsername string      `json:"gitLabUsername"`
	HasMacBook     bool        `json:"hasMacBook"`
	IPhoneUUID     pgtype.UUID `json:"iPhoneUUID"`
	IPadUUID       pgtype.UUID `json:"iPadUUID"`
	AppleWatchUUID pgtype.UUID `json:"appleWatchUUID"`
}

func GetDeveloperProfileDTOFromPostRequest(request PostDeveloperProfile, coursePhaseID, courseParticipationID uuid.UUID) db.CreateDeveloperProfileParams {
	return db.CreateDeveloperProfileParams{
		CoursePhaseID:         coursePhaseID,
		CourseParticipationID: courseParticipationID,
		AppleID:               request.AppleID,
		GitlabUsername:        request.GitLabUsername,
		HasMacbook:            request.HasMacBook,
		IphoneUuid:            request.IPhoneUUID,
		IpadUuid:              request.IPadUUID,
		AppleWatchUuid:        request.AppleWatchUUID,
	}
}

func GetDeveloperProfileDTOFromCreateRequest(request DeveloperProfile, coursePhaseID, courseParticipationID uuid.UUID) db.CreateOrUpdateDeveloperProfileParams {
	return db.CreateOrUpdateDeveloperProfileParams{
		CoursePhaseID:         coursePhaseID,
		CourseParticipationID: courseParticipationID,
		AppleID:               request.AppleID,
		GitlabUsername:        request.GitLabUsername,
		HasMacbook:            request.HasMacBook,
		IphoneUuid:            request.IPhoneUUID,
		IpadUuid:              request.IPadUUID,
		AppleWatchUuid:        request.AppleWatchUUID,
	}
}
