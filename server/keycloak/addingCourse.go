package keycloak

import (
	"context"
	"fmt"

	"github.com/Nerzal/gocloak/v13"
	log "github.com/sirupsen/logrus"
)

// TODO: add requester to newly created groups
func CreateCourseGroupsAndRoles(ctx context.Context, courseName, iterationName string) error {
	token, err := LoginClient(ctx)
	if err != nil {
		return err
	}

	// Define group and role names
	baseGroupName := fmt.Sprintf("prompt-%s-%s", courseName, iterationName)
	subGroupNames := []string{
		fmt.Sprintf("%s-Lecturer", baseGroupName),
		fmt.Sprintf("%s-Editor", baseGroupName),
		fmt.Sprintf("%s-Student", baseGroupName),
	}

	baseGroupID, err := CreateGroup(ctx, token.AccessToken, baseGroupName)
	if err != nil {
		return err
	}

	for _, roleName := range subGroupNames {

		role, err := CreateRealmRole(ctx, token.AccessToken, roleName)
		if err != nil {
			return err
		}

		// Create Subgroup with same name
		subGroupID, err := CreateChildGroup(ctx, token.AccessToken, roleName, baseGroupID)
		if err != nil {
			return err
		}

		// Associate role with group
		err = KeycloakSingleton.client.AddRealmRoleToGroup(ctx, token.AccessToken, KeycloakSingleton.Realm, subGroupID, []gocloak.Role{*role})
		if err != nil {
			log.Error("failed to associate role with group: ", err)
			return err
		}
	}
	return nil
}
