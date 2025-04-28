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
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	"github.com/ls1intum/prompt2/servers/intro_course/developerAccountSetup/developerAccountSetupDTO"
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

// GenerateJWT creates a JWT token required for Apple API authentication.
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
	signedToken, err := token.SignedString(key)
	if err != nil {
		return "", err
	}
	return signedToken, nil
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
