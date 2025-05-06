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
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	"github.com/ls1intum/prompt2/servers/intro_course/developerAccountSetup/developerAccountSetupDTO"
	log "github.com/sirupsen/logrus"
)

func generateJWT() (string, error) {
	now := time.Now()
	key, err := jwt.ParseECPrivateKeyFromPEM([]byte(DeveloperAccountSetupServiceSingleton.privateKey))
	if err != nil {
		log.Error("failed to parse Apple private key: ", err)
		return "", err
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

func inviteToAppleAccount(ctx context.Context, coursePhaseID, participationID uuid.UUID, appleID, firstName, lastName string) error {
	token, err := generateJWT()
	if err != nil {
		_ = storeAppleError(ctx, coursePhaseID, participationID, fmt.Errorf("JWT generation failed: %w", err))
		return err
	}

	payload := developerAccountSetupDTO.InviteRequest{
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

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx,
		"POST",
		"https://api.appstoreconnect.apple.com/v1/userInvitations",
		bytes.NewBuffer(bodyBytes))
	if err != nil {
		_ = storeAppleError(ctx, coursePhaseID, participationID,
			fmt.Errorf("failed to create HTTP request: %w", err))
		return err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		_ = storeAppleError(ctx, coursePhaseID, participationID, fmt.Errorf("request failed: %w", err))
		return err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusCreated {
		_ = storeAppleError(ctx, coursePhaseID, participationID, fmt.Errorf("failed to invite user: %s, details: %s", resp.Status, string(body)))
		return fmt.Errorf("failed to invite user: %s, details: %s", resp.Status, string(body))
	}

	log.Infof("User invited to Apple Developer account: %s", appleID)
	return storeAppleSuccess(ctx, coursePhaseID, participationID)
}

func registerDeviceWithApple(ctx context.Context, coursePhaseID, participationID uuid.UUID, name, udid, platform string) error {
	token, err := generateJWT()
	if err != nil {
		_ = storeAppleError(ctx, coursePhaseID, participationID, fmt.Errorf("JWT generation failed: %w", err))
		return err
	}

	payload := developerAccountSetupDTO.DeviceRequest{
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
				Name:     name,
				UDID:     udid,
				Platform: platform,
			},
		},
	}

	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "https://api.appstoreconnect.apple.com/v1/devices", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		_ = storeAppleError(ctx, coursePhaseID, participationID, fmt.Errorf("request failed: %w", err))
		return err
	}
	defer resp.Body.Close()

	body, readErr := io.ReadAll(resp.Body)
	if readErr != nil {
		_ = storeAppleError(ctx, coursePhaseID, participationID,
			fmt.Errorf("failed to read Apple response body: %w", readErr))
		return readErr
	}
	if resp.StatusCode != http.StatusCreated {
		apiErr := fmt.Errorf("failed to register device: %s, details: %s", resp.Status, string(body))
		_ = storeAppleError(ctx, coursePhaseID, participationID, apiErr)
		return apiErr
	}

	log.Infof("Device registered with Apple Developer account: %s", name)
	return storeAppleSuccess(ctx, coursePhaseID, participationID)
}

func storeAppleError(ctx context.Context, coursePhaseID, participationID uuid.UUID, err error) error {
	log.Error("Apple API error: ", err)
	dbErr := DeveloperAccountSetupServiceSingleton.queries.AddAppleError(ctx, db.AddAppleErrorParams{
		CoursePhaseID:         coursePhaseID,
		CourseParticipationID: participationID,
		ErrorMessage:          pgtype.Text{String: err.Error(), Valid: true},
	})
	if dbErr != nil {
		log.Error("Failed to store Apple error in DB: ", dbErr)
		return dbErr
	}
	return nil
}

func storeAppleSuccess(ctx context.Context, coursePhaseID, participationID uuid.UUID) error {
	err := DeveloperAccountSetupServiceSingleton.queries.AddAppleStatus(ctx, db.AddAppleStatusParams{
		CoursePhaseID:         coursePhaseID,
		CourseParticipationID: participationID,
	})
	if err != nil {
		log.Error("Failed to store Apple success in DB: ", err)
		return err
	}
	return nil
}
