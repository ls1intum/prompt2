package keycloakRealmManager

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/Nerzal/gocloak/v13"
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	log "github.com/sirupsen/logrus"
)

// TODO: think about caching token at some point
// Get connection tokes
func LoginClient(ctx context.Context) (*gocloak.JWT, error) {
	token, err := KeycloakRealmSingleton.client.LoginClient(ctx, KeycloakRealmSingleton.ClientID, KeycloakRealmSingleton.ClientSecret, KeycloakRealmSingleton.Realm)
	if err != nil {
		log.Error("failed to authenticate to Keycloak: ", err)
		return nil, err
	}
	return token, nil

}

func GetOrCreatePromptGroup(ctx context.Context, accessToken string) (string, error) {
	exact := true
	groups, err := KeycloakRealmSingleton.client.GetGroups(ctx, accessToken, KeycloakRealmSingleton.Realm, gocloak.GetGroupsParams{
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
	baseGroupID, err := KeycloakRealmSingleton.client.CreateGroup(ctx, accessToken, KeycloakRealmSingleton.Realm, group)
	if err != nil {
		log.Error("failed to create base group: ", err)
		return "", errors.New("failed to create keycloak roles")
	}
	return baseGroupID, nil
}

func GetCourseGroup(ctx context.Context, accessToken string, courseID uuid.UUID) (*gocloak.Group, error) {
	courseGroupName, err := GetCourseGroupName(ctx, courseID)
	if err != nil {
		return &gocloak.Group{}, fmt.Errorf("failed to get course group name: %w", err)
	}

	groupPath := "/" + TOP_LEVEL_GROUP_NAME + "/" + courseGroupName
	group, err := KeycloakRealmSingleton.client.GetGroupByPath(ctx, accessToken, KeycloakRealmSingleton.Realm, groupPath)
	if err != nil {
		return &gocloak.Group{}, fmt.Errorf("failed to get groups from Keycloak: %w", err)
	}

	// Look for an exact name match.
	if *group.Name == courseGroupName {
		return group, nil
	} else {
		return &gocloak.Group{}, errors.New("course group not found")
	}
}

func GetOrCreateCustomTopLevelGroup(ctx context.Context, accessToken string, courseID uuid.UUID) (string, error) {
	courseGroupName, err := GetCourseGroupName(ctx, courseID)
	if err != nil {
		return "", fmt.Errorf("failed to get course group name: %w", err)
	}

	groupPath := "/" + TOP_LEVEL_GROUP_NAME + "/" + courseGroupName + "/" + CUSTOM_GROUPS_NAME
	group, err := KeycloakRealmSingleton.client.GetGroupByPath(ctx, accessToken, KeycloakRealmSingleton.Realm, groupPath)
	if err == nil && *group.Name == CUSTOM_GROUPS_NAME {
		return *group.ID, nil
	} else if !strings.Contains(err.Error(), "404") {
		log.Error("failed to get groups from keycloak: ", err)
		return "", errors.New("failed to get groups")
	}

	// did not find -> create the group
	// we first need to get the course group id
	courseGroup, err := GetCourseGroup(ctx, accessToken, courseID)
	if err != nil {
		log.Error("failed to get course group: ", err)
		return "", errors.New("failed to get groups")
	}

	// try to create group
	groupID, err := CreateChildGroup(ctx, accessToken, CUSTOM_GROUPS_NAME, *courseGroup.ID)
	if err != nil {
		log.Error("failed to create custom top level group: ", err)
		return "", errors.New("failed to get groups")
	}
	return groupID, nil
}

func CreateChildGroup(ctx context.Context, accessToken, groupName, parentGroupID string) (string, error) {
	group := gocloak.Group{
		Name: &groupName,
	}

	childGroupID, err := KeycloakRealmSingleton.client.CreateChildGroup(ctx, accessToken, KeycloakRealmSingleton.Realm, parentGroupID, group)
	if err != nil {
		log.Error("failed to create child group: ", err)
		return "", errors.New("failed to create keycloak roles")
	}

	return childGroupID, err
}

func GetOrCreateCustomGroup(ctx context.Context, accessToken, parentGroupID, groupName string) (string, error) {
	// First get the parent group
	parentGroup, err := KeycloakRealmSingleton.client.GetGroup(ctx, accessToken, KeycloakRealmSingleton.Realm, parentGroupID)
	if err != nil {
		log.Error("failed to get parent group: ", err)
		return "", errors.New("failed to create keycloak groups")
	}

	for _, childGroup := range *parentGroup.SubGroups {
		if *childGroup.Name == groupName {
			return *childGroup.ID, nil
		}
	}

	// Create the child group if it does not yet exists
	group := gocloak.Group{
		Name: &groupName,
	}

	childGroupID, err := KeycloakRealmSingleton.client.CreateChildGroup(ctx, accessToken, KeycloakRealmSingleton.Realm, parentGroupID, group)
	if err != nil {
		log.Error("failed to create child group: ", err)
		return "", errors.New("failed to create keycloak roles")
	}

	// Associate the role with the group

	return childGroupID, err
}

func GetOrCreateRealmRole(ctx context.Context, accessToken, roleName string) (*gocloak.Role, error) {
	// Trying to get (check if exists)
	existingRole, err := KeycloakRealmSingleton.client.GetClientRole(ctx, accessToken, KeycloakRealmSingleton.Realm, KeycloakRealmSingleton.idOfClient, roleName)
	if err == nil {
		// Case 1: Role already exists
		log.Debug("Role already exists: ", existingRole.ID)
		return existingRole, nil
	} else if !strings.Contains(err.Error(), "404") {
		// Case 2: Error occurred
		log.Error("failed to get role: ", err)
		return nil, err
	}

	// Case 3: Role does not exist
	// Creating realm role (only returns name)
	name, err := KeycloakRealmSingleton.client.CreateClientRole(ctx, accessToken, KeycloakRealmSingleton.Realm, KeycloakRealmSingleton.idOfClient, gocloak.Role{Name: &roleName})
	if err != nil {
		log.Error("failed to create role: ", err)
		return nil, err
	}

	// Getting the just created role
	createdRole, err := KeycloakRealmSingleton.client.GetClientRole(ctx, accessToken, KeycloakRealmSingleton.Realm, KeycloakRealmSingleton.idOfClient, name)
	if err != nil {
		log.Error("failed to get role: ", err)
		return nil, err
	}

	return createdRole, nil
}

func GetCourseGroupName(ctx context.Context, courseID uuid.UUID) (string, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	course, err := KeycloakRealmSingleton.queries.GetCourse(ctxWithTimeout, courseID)
	if err != nil {
		return "", fmt.Errorf("failed to get course: %w", err)
	}

	courseGroupName := course.SemesterTag.String + "-" + course.Name
	return courseGroupName, nil
}

// Has no side effects if the role is already associated with the group
func AddRoleToGroup(ctx context.Context, accessToken, groupID string, role *gocloak.Role) error {
	err := KeycloakRealmSingleton.client.AddClientRolesToGroup(ctx, accessToken, KeycloakRealmSingleton.Realm, KeycloakRealmSingleton.idOfClient, groupID, []gocloak.Role{*role})
	if err != nil {
		log.Error("failed to associate role with group: ", err)
		return err
	}

	return nil
}
