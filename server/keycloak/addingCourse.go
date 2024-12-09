package keycloak

import (
	"context"
	"fmt"

	"github.com/Nerzal/gocloak/v13"
	"github.com/niclasheun/prompt2.0/keycloak"
	log "github.com/sirupsen/logrus"
)

// TODO: add requester to newly created groups
func CreateCourseGroupsAndRoles(ctx context.Context, courseName, iterationName string) error {
	token, err := LoginClient(ctx)
	if err != nil {
		return err
	}

	baseGroupName := fmt.Sprintf("%s-%s", courseName, iterationName)
	subGroupNames := []string{
		fmt.Sprintf("%s-%s", baseGroupName, keycloak.CourseLecturer),
		fmt.Sprintf("%s-%s", baseGroupName, keycloak.CourseEditor),
		fmt.Sprintf("%s-%s", baseGroupName, keycloak.CourseStudent),
	}

	baseGroupID, err := CreateGroup(ctx, token.AccessToken, baseGroupName)
	if err != nil {
		return err
	}

	for _, roleName := range subGroupNames {
		// TODO: Welche rollen sollten wir hier anlegen?
		// Lecturer, Editor, Student oder "courses:create", "courseName-semsterTag:view"??
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
		err = KeycloakSingleton.client.AddClientRolesToGroup(ctx, token.AccessToken, KeycloakSingleton.Realm, KeycloakSingleton.idOfClient, subGroupID, []gocloak.Role{*role})
		if err != nil {
			log.Error("failed to associate role with group: ", err)
			return err
		}
	}
	return nil
}
