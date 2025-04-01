package developerAccountSetup

import (
	"bytes"
	"encoding/json"
	"fmt"
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
	token := jwt.NewWithClaims(jwt.SigningMethodES256, jwt.MapClaims{
		"iss": issuerID,
		"exp": now.Add(5 * time.Minute).Unix(),
		"aud": "appstoreconnect-v1",
		"iat": now.Unix(),
	})

	token.Header["kid"] = keyID
	signedToken, err := token.SignedString([]byte(privateKey))
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

func InviteUser(email, firstName, lastName string) error {
	token, err := GenerateJWT()
	if err != nil {
		return err
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
				Email:               email,
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

	if resp.StatusCode == 201 {
		fmt.Println("User invited successfully:", email)
		return nil
	} else {
		return fmt.Errorf("failed to invite user: %s", resp.Status)
	}
}
