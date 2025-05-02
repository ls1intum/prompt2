package developerAccountSetup

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt-sdk/promptTypes"
	"github.com/ls1intum/prompt2/servers/intro_course/coreRequests"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	"github.com/ls1intum/prompt2/servers/intro_course/developerAccountSetup/developerAccountSetupDTO"
	"github.com/ls1intum/prompt2/servers/intro_course/developerProfile"
	"github.com/ls1intum/prompt2/servers/intro_course/utils"
	log "github.com/sirupsen/logrus"
)

type DeveloperAccountSetupService struct {
	queries    db.Queries
	conn       *pgxpool.Pool
	issuerID   string
	keyID      string
	privateKey string
}

var DeveloperAccountSetupServiceSingleton *DeveloperAccountSetupService

func InviteUsers(ctx context.Context, participations []promptTypes.CoursePhaseParticipationWithStudent) ([]map[string]string, error) {
	results := []map[string]string{}
	for _, p := range participations {
		devProfile, err := developerProfile.GetOwnDeveloperProfile(ctx, p.CoursePhaseID, p.CourseParticipationID)
		if err != nil {
			results = append(results, map[string]string{
				"appleID": p.Student.Email,
				"status":  "Failed to get developer profile",
			})
			continue
		}

		err = inviteToAppleAccount(ctx, p.CoursePhaseID, p.CourseParticipationID, devProfile.AppleID, p.Student.FirstName, p.Student.LastName)
		if err != nil {
			results = append(results, map[string]string{
				"appleID": devProfile.AppleID,
				"status":  "Failed: " + err.Error(),
			})
		} else {
			results = append(results, map[string]string{
				"appleID": devProfile.AppleID,
				"status":  "Success",
			})
		}
	}
	return results, nil
}

func HandleInviteUser(ctx context.Context, authHeader string, coursePhaseID, courseParticipationID uuid.UUID) error {
	student, err := coreRequests.SendGetStudent(authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		return fmt.Errorf("failed to get student details: %w", err)
	}

	devProfile, err := developerProfile.GetOwnDeveloperProfile(ctx, coursePhaseID, courseParticipationID)
	if err != nil {
		return fmt.Errorf("failed to get developer profile: %w", err)
	}

	return inviteToAppleAccount(ctx, coursePhaseID, courseParticipationID, devProfile.AppleID, student.FirstName, student.LastName)
}

func InviteAllUsers(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]map[string]string, error) {
	coreURL := utils.GetCoreUrl()
	participations, err := promptSDK.FetchAndMergeParticipationsWithResolutions(coreURL, authHeader, coursePhaseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course phase participations: %w", err)
	}
	return InviteUsers(ctx, participations)
}

func RegisterAllDevices(ctx context.Context, authHeader string, coursePhaseID, courseParticipationID uuid.UUID, semesterTag string) ([]map[string]string, error) {
	devProfile, err := developerProfile.GetOwnDeveloperProfile(ctx, coursePhaseID, courseParticipationID)
	if err != nil {
		return nil, fmt.Errorf("failed to get developer profile: %w", err)
	}

	student, err := coreRequests.SendGetStudent(authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		return nil, fmt.Errorf("failed to get student details: %w", err)
	}

	devices := []struct {
		Name string
		UDID pgtype.Text
	}{
		{Name: semesterTag + "-" + student.LastName + "-" + "Apple Watch", UDID: devProfile.AppleWatchUDID},
		{Name: semesterTag + "-" + student.LastName + "-" + "iPhone", UDID: devProfile.IPhoneUDID},
		{Name: semesterTag + "-" + student.LastName + "-" + "iPad", UDID: devProfile.IPadUDID},
	}

	var results []map[string]string
	for _, device := range devices {
		if device.UDID.Valid {
			err := registerDeviceWithApple(ctx, coursePhaseID, courseParticipationID, device.Name, device.UDID.String, "IOS")
			status := "Success"
			if err != nil {
				status = "Failed: " + err.Error()
			}
			results = append(results, map[string]string{
				"deviceName": device.Name,
				"status":     status,
			})
		}
	}
	return results, nil
}

func RegisterSingleDevice(ctx context.Context, authHeader string, coursePhaseID, courseParticipationID uuid.UUID, semesterTag string, deviceType string) error {
	devProfile, err := developerProfile.GetOwnDeveloperProfile(ctx, coursePhaseID, courseParticipationID)
	if err != nil {
		return fmt.Errorf("failed to get developer profile: %w", err)
	}

	student, err := coreRequests.SendGetStudent(authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		return fmt.Errorf("failed to get student details: %w", err)
	}

	var udid pgtype.Text
	switch deviceType {
	case "iPhone":
		udid = devProfile.IPhoneUDID
	case "iPad":
		udid = devProfile.IPadUDID
	case "Apple Watch":
		udid = devProfile.AppleWatchUDID
	}

	deviceName := semesterTag + "-" + student.LastName + "-" + deviceType
	return registerDeviceWithApple(ctx, coursePhaseID, courseParticipationID, deviceName, udid.String, "IOS")
}

func GetAllStudentAppleStatus(c context.Context, coursePhaseID uuid.UUID) ([]developerAccountSetupDTO.AppleStatus, error) {
	gitlabStatuses, err := DeveloperAccountSetupServiceSingleton.queries.GetAllAppleStatus(c, coursePhaseID)
	if err != nil {
		log.Error("Failed to get gitlab statuses: ", err)
		return nil, err
	}

	return developerAccountSetupDTO.GetAppleStatusDTOsFromModels(gitlabStatuses), nil

}
