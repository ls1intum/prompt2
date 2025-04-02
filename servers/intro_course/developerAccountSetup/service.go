package developerAccountSetup

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

type DeveloperAccountSetupService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var DeveloperAccountSetupServiceSingleton *DeveloperAccountSetupService

const (
	issuerID   = "YOUR_ISSUER_ID"
	keyID      = "YOUR_KEY_ID"
	privateKey = `YOUR_PRIVATE_KEY`
)

// GenerateJWT creates a JWT token required for Apple API authentication.
func GenerateJWT() (string, error) {
	now := time.Now()

	key, err := jwt.ParseECPrivateKeyFromPEM([]byte(privateKey))
	if err != nil {
		return "", fmt.Errorf("error parsing private key: %w", err)
	}

	token := jwt.NewWithClaims(jwt.SigningMethodES256, jwt.MapClaims{
		"iss": issuerID,
		"exp": now.Add(5 * time.Minute).Unix(),
		"aud": "appstoreconnect-v1",
		"iat": now.Unix(),
	})

	token.Header["kid"] = keyID
	signedToken, err := token.SignedString(key)
	if err != nil {
		return "", err
	}
	return signedToken, nil
}

type InviteRequest struct {
	Data struct {
		Type       string `json:"type"`
		Attributes struct {
			Email               string   `json:"email"`
			FirstName           string   `json:"firstName"`
			LastName            string   `json:"lastName"`
			Roles               []string `json:"roles"`
			ProvisioningAllowed bool     `json:"provisioningAllowed"`
		} `json:"attributes"`
	} `json:"data"`
}

type DeviceRequest struct {
	Data struct {
		Type       string `json:"type"`
		Attributes struct {
			Name     string `json:"name"`
			UDID     string `json:"udid"`
			Platform string `json:"platform"`
		} `json:"attributes"`
	} `json:"data"`
}

func InviteUser(appleID, firstName, lastName string) error {
	token, err := GenerateJWT()
	if err != nil {
		return fmt.Errorf("JWT generation failed: %w", err)
	}

	requestBody := InviteRequest{
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

	requestBodyBytes, _ := json.Marshal(requestBody)

	req, err := http.NewRequest("POST", "https://api.appstoreconnect.apple.com/v1/userInvitations", bytes.NewBuffer(requestBodyBytes))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode == 201 {
		fmt.Println("User invited successfully:", appleID)
		return nil
	} else {
		return fmt.Errorf("failed to invite user: %s, details: %s", resp.Status, string(body))
	}
}

func RegisterDevice(deviceName, deviceUDID, platform string) error {
	token, err := GenerateJWT()
	if err != nil {
		return fmt.Errorf("JWT generation failed: %w", err)
	}

	requestBody := DeviceRequest{
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

	requestBodyBytes, _ := json.Marshal(requestBody)

	req, err := http.NewRequest("POST", "https://api.appstoreconnect.apple.com/v1/devices", bytes.NewBuffer(requestBodyBytes))
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error sending request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 201 {
		fmt.Println("Device registered successfully:", deviceName)
		return nil
	} else {
		return fmt.Errorf("failed to register device: %s", resp.Status)
	}
}
