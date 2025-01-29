package keycloak

import (
	"context"
	"errors"
	"fmt"

	"github.com/Nerzal/gocloak/v13"
	log "github.com/sirupsen/logrus"
)

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

func GetOrCreatePromptGroup(ctx context.Context, accessToken string) (string, error) {
	exact := true
	groups, err := KeycloakSingleton.client.GetGroups(ctx, accessToken, KeycloakSingleton.Realm, gocloak.GetGroupsParams{
		Search: &TOP_LEVEL_GROUP_NAME,
		Exact:  &exact,
	})
	if err != nil {
		return "", fmt.Errorf("failed to get groups from Keycloak: %w", err)
	}

	// Look for an exact name match.
	if len(groups) == 1 && *groups[0].Name == TOP_LEVEL_GROUP_NAME {
		return *groups[0].ID, nil
	}

	// If no exact match was found, create the group.
	group := gocloak.Group{
		Name: &TOP_LEVEL_GROUP_NAME,
	}

	// try to create group
	baseGroupID, err := KeycloakSingleton.client.CreateGroup(ctx, accessToken, KeycloakSingleton.Realm, group)
	if err != nil {
		log.Error("failed to create base group: ", err)
		return "", errors.New("failed to create keycloak roles")
	}
	return baseGroupID, nil
}

func CreateChildGroup(ctx context.Context, accessToken, groupName, parentGroupID string) (string, error) {
	group := gocloak.Group{
		Name: &groupName,
	}

	childGroupID, err := KeycloakSingleton.client.CreateChildGroup(ctx, accessToken, KeycloakSingleton.Realm, parentGroupID, group)
	if err != nil {
		log.Error("failed to create child group: ", err)
		return "", errors.New("failed to create keycloak roles")
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
