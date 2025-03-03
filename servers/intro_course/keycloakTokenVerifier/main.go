package keycloakTokenVerifier

import (
	"context"
	"log"

	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

type KeycloakTokenVerifier struct {
	BaseURL                 string
	Realm                   string
	ClientID                string
	expectedAuthorizedParty string
	queries                 db.Queries
}

var KeycloakTokenVerifierSingleton *KeycloakTokenVerifier

func InitKeycloakTokenVerifier(ctx context.Context, BaseURL, Realm, ClientID, expectedAuthorizedParty string, queries db.Queries) {
	KeycloakTokenVerifierSingleton = &KeycloakTokenVerifier{
		BaseURL:                 BaseURL,
		Realm:                   Realm,
		ClientID:                ClientID,
		expectedAuthorizedParty: expectedAuthorizedParty,
		queries:                 queries,
	}

	// init the middleware
	err := InitKeycloakVerifier()
	if err != nil {
		log.Fatal("Failed to initialize Keycloak verifier: ", err)
	}
}
