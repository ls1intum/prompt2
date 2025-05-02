package developerAccountSetup

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
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

func GenerateJWT() (string, error) {
	now := time.Now()
	key, err := jwt.ParseECPrivateKeyFromPEM([]byte(DeveloperAccountSetupServiceSingleton.privateKey))
	if err != nil {
		return "", fmt.Errorf("error parsing private key: %w", err)
	}

	token := jwt.NewWithClaims(jwt.SigningMethodES256, jwt.MapClaims{
		"iss": DeveloperAccountSetupServiceSingleton.issuerID,
		"exp": now.Add(5 * time.Minute).Unix(),
		"aud": "appstoreconnect-v1",
		"iat": now.Unix(),
	})

	token.Header["kid"] = DeveloperAccountSetupServiceSingleton.keyID
	return token.SignedString(key)
}

func InviteUsers(ctx context.Context, coursePhaseID uuid.UUID, participations []promptTypes.CoursePhaseParticipationWithStudent) ([]map[string]string, error) {
	results := []map[string]string{}
	for _, p := range participations {
		devProfile, err := developerProfile.GetOwnDeveloperProfile(ctx, p.CoursePhaseID, p.CourseParticipationID)
		if err != nil {
			log.Error("DevProfile error for student ", p.Student.ID, ": ", err)
			results = append(results, map[string]string{
				"appleID": p.Student.Email,
				"status":  "Failed to get developer profile",
			})
			continue
		}
		err = InviteUser(ctx, p.CoursePhaseID, p.CourseParticipationID, devProfile.AppleID, p.Student.FirstName, p.Student.LastName)
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

func InviteUser(ctx context.Context, coursePhaseID, courseParticipationID uuid.UUID, appleID, firstName, lastName string) error {
	token, err := GenerateJWT()
	if err != nil {
		return storeAppleError(ctx, coursePhaseID, courseParticipationID, fmt.Errorf("JWT generation failed: %w", err))
	}

	requestBody := developerAccountSetupDTO.InviteRequest{
		Data: struct {
			Type       string `json:"type"`
			Attributes struct {
				Email               string   `json:"email"`
				FirstName           string   `json:"firstName"`
				LastName            string   `json:"lastName"`
				Roles               []string `json:"roles"`
				ProvisioningAllowed bool     `json:"provisioningAllowed"`
			} `json:"attributes"`
		}{
			Type: "userInvitations",
			Attributes: struct {
				Email               string   `json:"email"`
				FirstName           string   `json:"firstName"`
				LastName            string   `json:"lastName"`
				Roles               []string `json:"roles"`
				ProvisioningAllowed bool     `json:"provisioningAllowed"`
			}{
				Email:               appleID,
				FirstName:           firstName,
				LastName:            lastName,
				Roles:               []string{"DEVELOPER"},
				ProvisioningAllowed: true,
			},
		},
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return storeAppleError(ctx, coursePhaseID, courseParticipationID, fmt.Errorf("marshal error: %w", err))
	}

	req, err := http.NewRequest("POST", "https://api.appstoreconnect.apple.com/v1/userInvitations", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return storeAppleError(ctx, coursePhaseID, courseParticipationID, fmt.Errorf("request creation failed: %w", err))
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return storeAppleError(ctx, coursePhaseID, courseParticipationID, fmt.Errorf("request failed: %w", err))
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 201 {
		return storeAppleError(ctx, coursePhaseID, courseParticipationID, fmt.Errorf("failed to invite user: %s, details: %s", resp.Status, string(body)))
	}

	log.Infof("User invited successfully: %s", appleID)
	return storeAppleSuccess(ctx, coursePhaseID, courseParticipationID)
}

func RegisterDevice(ctx context.Context, coursePhaseID, courseParticipationID uuid.UUID, deviceName, deviceUDID, platform string) error {
	token, err := GenerateJWT()
	if err != nil {
		return storeAppleError(ctx, coursePhaseID, courseParticipationID, fmt.Errorf("JWT generation failed: %w", err))
	}

	requestBody := developerAccountSetupDTO.DeviceRequest{
		Data: struct {
			Type       string `json:"type"`
			Attributes struct {
				Name     string `json:"name"`
				UDID     string `json:"udid"`
				Platform string `json:"platform"`
			} `json:"attributes"`
		}{
			Type: "devices",
			Attributes: struct {
				Name     string `json:"name"`
				UDID     string `json:"udid"`
				Platform string `json:"platform"`
			}{
				Name:     deviceName,
				UDID:     deviceUDID,
				Platform: platform,
			},
		},
	}

	bodyBytes, _ := json.Marshal(requestBody)
	req, err := http.NewRequest("POST", "https://api.appstoreconnect.apple.com/v1/devices", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return storeAppleError(ctx, coursePhaseID, courseParticipationID, fmt.Errorf("request creation failed: %w", err))
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return storeAppleError(ctx, coursePhaseID, courseParticipationID, fmt.Errorf("request failed: %w", err))
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 201 {
		return storeAppleError(ctx, coursePhaseID, courseParticipationID, fmt.Errorf("failed to register device: %s, details: %s", resp.Status, string(body)))
	}

	log.Infof("Device registered successfully: %s", deviceName)
	return storeAppleSuccess(ctx, coursePhaseID, courseParticipationID)
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

	return InviteUser(ctx, coursePhaseID, courseParticipationID, devProfile.AppleID, student.FirstName, student.LastName)
}

func InviteAllUsers(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]map[string]string, error) {
	coreURL := utils.GetCoreUrl()
	participations, err := promptSDK.FetchAndMergeParticipationsWithResolutions(coreURL, authHeader, coursePhaseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course phase participations: %w", err)
	}
	return InviteUsers(ctx, coursePhaseID, participations)
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
			err := RegisterDevice(ctx, coursePhaseID, courseParticipationID, device.Name, device.UDID.String, "IOS")
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
	return RegisterDevice(ctx, coursePhaseID, courseParticipationID, deviceName, udid.String, "IOS")
}

func storeAppleError(ctx context.Context, coursePhaseID, courseParticipationID uuid.UUID, err error) error {
	log.Error("Apple Setup Error: ", err)
	dbErr := DeveloperAccountSetupServiceSingleton.queries.AddAppleError(ctx, db.AddAppleErrorParams{
		CoursePhaseID:         coursePhaseID,
		CourseParticipationID: courseParticipationID,
		ErrorMessage:          pgtype.Text{String: err.Error(), Valid: true},
	})
	if dbErr != nil {
		log.Error("Failed to store apple error in DB: ", dbErr)
	}
	return err
}

func storeAppleSuccess(ctx context.Context, coursePhaseID, courseParticipationID uuid.UUID) error {
	err := DeveloperAccountSetupServiceSingleton.queries.AddAppleStatus(ctx, db.AddAppleStatusParams{
		CoursePhaseID:         coursePhaseID,
		CourseParticipationID: courseParticipationID,
	})
	if err != nil {
		log.Error("Failed to store apple success in DB: ", err)
		return err
	}
	return nil
}
