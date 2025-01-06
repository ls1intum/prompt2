package keycloak

import (
	"context"

	"github.com/Nerzal/gocloak/v13"
)

type KeycloakClientManager struct {
	client                  *gocloak.GoCloak
	BaseURL                 string
	Realm                   string
	ClientID                string
	ClientSecret            string
	idOfClient              string
	expectedAuthorizedParty string
}

var KeycloakSingleton *KeycloakClientManager

func InitKeycloak(ctx context.Context, BaseURL, Realm, ClientID, ClientSecret, idOfClient, expectedAuthorizedParty string) error {
	KeycloakSingleton = &KeycloakClientManager{
		client:                  gocloak.NewClient(BaseURL),
		BaseURL:                 BaseURL,
		Realm:                   Realm,
		ClientID:                ClientID,
		ClientSecret:            ClientSecret,
		idOfClient:              idOfClient,
		expectedAuthorizedParty: expectedAuthorizedParty,
	}

	// Test Login connection
	_, err := LoginClient(ctx)

	// init the middleware
	InitKeycloakVerifier()

	return err
}
