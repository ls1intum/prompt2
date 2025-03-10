package developerProfileDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

type DeveloperProfile struct {
	CoursePhaseID         uuid.UUID   `json:"coursePhaseID"`
	CourseParticipationID uuid.UUID   `json:"courseParticipationID"`
	HasMacBook            bool        `json:"hasMacbook"`
	IPhoneUUID            pgtype.UUID `json:"iPhoneUUID"`
	IPadUUID              pgtype.UUID `json:"iPadUUID"`
	AppleWatchUUID        pgtype.UUID `json:"appleWatchUUID"`
}

func GetDeveloperProfileDTOFromDBModel(model db.DeveloperProfile) DeveloperProfile {
	return DeveloperProfile{
		CoursePhaseID:         model.CoursePhaseID,
		CourseParticipationID: model.CourseParticipationID,
		HasMacBook:            model.HasMacbook,
		IPhoneUUID:            model.IphoneUuid,
		IPadUUID:              model.IphoneUuid,
		AppleWatchUUID:        model.AppleWatchUuid,
	}
}
