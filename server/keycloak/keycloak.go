package keycloak

import (
	"context"

	"github.com/Nerzal/gocloak/v13"
	log "github.com/sirupsen/logrus"
)

type KeycloakClientManager struct {
	client       *gocloak.GoCloak
	BaseURL      string
	Realm        string
	ClientID     string
	ClientSecret string
	idOfClient   string
}

var KeycloakSingleton *KeycloakClientManager

func InitKeycloak(ctx context.Context, BaseURL, Realm, ClientID, ClientSecret, idOfClient string) error {
	KeycloakSingleton = &KeycloakClientManager{
		client:       gocloak.NewClient(BaseURL),
		BaseURL:      BaseURL,
		Realm:        Realm,
		ClientID:     ClientID,
		ClientSecret: ClientSecret,
		idOfClient:   idOfClient,
	}

	// Test Login connection
	_, err := LoginClient(ctx)
	return err
}

// TODO: think about caching token at some point
// Get connection tokes
func LoginClient(ctx context.Context) (*gocloak.JWT, error) {
	token, err := KeycloakSingleton.client.LoginClient(ctx, KeycloakSingleton.ClientID, KeycloakSingleton.ClientSecret, KeycloakSingleton.Realm)
	if err != nil {
		log.Error("failed to authenticate to Keycloak: ", err)
		return nil, err
	}
	return token, nil

}

func CreateGroup(ctx context.Context, accessToken, groupName string) (string, error) {
	group := gocloak.Group{
		Name: &groupName,
	}

	baseGroupID, err := KeycloakSingleton.client.CreateGroup(ctx, accessToken, KeycloakSingleton.Realm, group)
	if err != nil {
		log.Error("failed to create base group: ", err)
	}
	return baseGroupID, err
}

func CreateChildGroup(ctx context.Context, accessToken, groupName, parentGroupID string) (string, error) {
	group := gocloak.Group{
		Name: &groupName,
	}

	childGroupID, err := KeycloakSingleton.client.CreateChildGroup(ctx, accessToken, KeycloakSingleton.Realm, parentGroupID, group)
	if err != nil {
		log.Error("failed to create child group: ", err)
	}

	return childGroupID, err
}

func CreateRealmRole(ctx context.Context, accessToken, roleName string) (*gocloak.Role, error) {
	// Creating realm role (only returns name)
	name, err := KeycloakSingleton.client.CreateClientRole(ctx, accessToken, KeycloakSingleton.Realm, KeycloakSingleton.idOfClient, gocloak.Role{Name: &roleName})
	if err != nil {
		log.Error("failed to create role: ", err)
		return nil, err
	}

	// Getting the just created role
	createdRole, err := KeycloakSingleton.client.GetClientRole(ctx, accessToken, KeycloakSingleton.Realm, KeycloakSingleton.idOfClient, name)
	if err != nil {
		log.Error("failed to get role: ", err)
		return nil, err
	}
	log.Debug("Got full Role with name: ", createdRole.ID)

	return createdRole, nil
}
