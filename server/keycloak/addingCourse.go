package keycloak

import (
	"context"
	"fmt"

	"github.com/Nerzal/gocloak/v13"
	log "github.com/sirupsen/logrus"
)

func CreateCourseGroupsAndRoles(ctx context.Context, courseName, iterationName, userID string) error {
	token, err := LoginClient(ctx)
	if err != nil {
		return err
	}

	promptGroupID, err := GetOrCreatePromptGroup(ctx, token.AccessToken)
	if err != nil {
		return err
	}

	courseGroupName := fmt.Sprintf("%s-%s", iterationName, courseName)
	courseGroupID, err := CreateChildGroup(ctx, token.AccessToken, courseGroupName, promptGroupID)
	if err != nil {
		return err
	}

	subGroupNames := []string{CourseLecturer, CourseEditor}
	for _, groupName := range subGroupNames {
		// create role for the group
		roleName := fmt.Sprintf("%s-%s-%s", iterationName, courseName, groupName)
		role, err := CreateRealmRole(ctx, token.AccessToken, roleName)
		if err != nil {
			return err
		}

		// Create Subgroup with courseGroup as parent
		subGroupID, err := CreateChildGroup(ctx, token.AccessToken, groupName, courseGroupID)
		if err != nil {
			return err
		}

		// Associate role with group
		err = KeycloakSingleton.client.AddClientRolesToGroup(ctx, token.AccessToken, KeycloakSingleton.Realm, KeycloakSingleton.idOfClient, subGroupID, []gocloak.Role{*role})
		if err != nil {
			log.Error("failed to associate role with group: ", err)
			return err
		}

		// Add the requester to the lecturer group
		if groupName == CourseLecturer {
			err = KeycloakSingleton.client.AddUserToGroup(ctx, token.AccessToken, KeycloakSingleton.Realm, userID, subGroupID)
			if err != nil {
				log.Error("failed to add user to group: ", err)
				return err
			}
		}
	}
	return nil
}
