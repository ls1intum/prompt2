package keycloakRealmManager

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

func AddCustomGroup(ctx context.Context, courseID uuid.UUID, groupName string) (string, error) {
	courseGroupName, err := GetCourseGroupName(ctx, courseID)
	if err != nil {
		return "", fmt.Errorf("failed to get course group name: %w", err)
	}

	// 1. Log into keycloak
	token, err := LoginClient(ctx)
	if err != nil {
		return "", err
	}

	// 2. Get Custom Group Folder
	customTopLevelGroupID, err := GetOrCreateCustomTopLevelGroup(ctx, token.AccessToken, courseID)
	if err != nil {
		log.Error("Failed to get or create custom top level group: ", err)
		return "", errors.New("failed to get or create custom top level group")
	}

	// 3. Get Custom subgroup or create
	customGroupID, err := GetOrCreateCustomGroup(ctx, token.AccessToken, customTopLevelGroupID, groupName)
	if err != nil {
		log.Error("Failed to get or create custom group: ", err)
		return "", errors.New("failed to get or create custom top level group")
	}

	// 4. Create desired role
	roleName := courseGroupName + "-cg-" + groupName
	role, err := GetOrCreateRealmRole(ctx, token.AccessToken, roleName)
	if err != nil {
		log.Error("failed to create role: ", err)
		return "", errors.New("failed to create keycloak roles")
	}

	// 5. Associate role with group
	err = AddRoleToGroup(ctx, token.AccessToken, customGroupID, role)
	if err != nil {
		log.Error("failed to associate role with group: ", err)
		return "", errors.New("failed to associate role with group")
	}

	return customGroupID, nil
	// 4. Add desired group to subgroup

}
