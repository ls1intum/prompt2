package keycloakTokenVerifier

import (
	"context"
	"log"
)

type KeycloakTokenVerifier struct {
	BaseURL                 string
	Realm                   string
	ClientID                string
	expectedAuthorizedParty string
}

var KeycloakTokenVerifierSingleton *KeycloakTokenVerifier

func InitKeycloakTokenVerifier(ctx context.Context, BaseURL, Realm, ClientID, expectedAuthorizedParty string) {
	KeycloakTokenVerifierSingleton = &KeycloakTokenVerifier{
		BaseURL:                 BaseURL,
		Realm:                   Realm,
		ClientID:                ClientID,
		expectedAuthorizedParty: expectedAuthorizedParty,
	}

	// init the middleware
	err := InitKeycloakVerifier()
	if err != nil {
		log.Fatal("Failed to initialize Keycloak verifier: ", err)
	}
}
