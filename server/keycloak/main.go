package keycloak

import (
	"context"

	"github.com/Nerzal/gocloak/v13"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type KeycloakClientManager struct {
	client                  *gocloak.GoCloak
	BaseURL                 string
	Realm                   string
	ClientID                string
	ClientSecret            string
	idOfClient              string
	expectedAuthorizedParty string
	queries                 db.Queries
}

var KeycloakSingleton *KeycloakClientManager

var TOP_LEVEL_GROUP_NAME = "Prompt"

func InitKeycloak(ctx context.Context, BaseURL, Realm, ClientID, ClientSecret, idOfClient, expectedAuthorizedParty string, queries db.Queries) error {
	KeycloakSingleton = &KeycloakClientManager{
		client:                  gocloak.NewClient(BaseURL),
		BaseURL:                 BaseURL,
		Realm:                   Realm,
		ClientID:                ClientID,
		ClientSecret:            ClientSecret,
		idOfClient:              idOfClient,
		expectedAuthorizedParty: expectedAuthorizedParty,
		queries:                 queries,
	}

	// Test Login connection
	_, err := LoginClient(ctx)

	// init the middleware
	InitKeycloakVerifier()

	return err
}
