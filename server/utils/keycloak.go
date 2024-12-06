package utils

import (
	"context"
	"fmt"

	"github.com/Nerzal/gocloak/v13"
	log "github.com/sirupsen/logrus"
)

type KeycloakConfig struct {
	BaseURL      string
	Realm        string
	ClientID     string
	ClientSecret string
}

func CreateCourseGroupsAndRoles(ctx context.Context, config KeycloakConfig, courseName, iterationName string) error {
	log.Info("trying to do stuff")
	client := gocloak.NewClient(config.BaseURL)
	log.Info("still here")
	// Authenticate
	token, err := client.LoginClient(ctx, config.ClientID, config.ClientSecret, config.Realm)
	if err != nil {
		log.Info("failed to authenticate to Keycloak: ", err)
		return err
	}
	log.Info("logged in")

	// Define group and role names
	baseGroupName := fmt.Sprintf("%s-%s", courseName, iterationName)
	subGroupNames := []string{
		fmt.Sprintf("%s-Lecturer", baseGroupName),
		fmt.Sprintf("%s-Editor", baseGroupName),
		fmt.Sprintf("%s-Student", baseGroupName),
	}

	// Create the base group
	group := gocloak.Group{
		Name: &baseGroupName,
	}

	baseGroupID, err := client.CreateGroup(ctx, token.AccessToken, config.Realm, group)
	if err != nil {
		log.Error("failed to create base group: ", err)
		return err
	}

	for _, roleName := range subGroupNames {
		// Creating realm role
		name, err := client.CreateRealmRole(ctx, token.AccessToken, config.Realm, gocloak.Role{Name: &roleName})
		if err != nil {
			log.Error("failed to create role: ", err)
			return err
		}
		log.Info("Created Role: ", name)

		// Getting the just created role
		createdRole, err := client.GetRealmRole(ctx, token.AccessToken, config.Realm, name)
		if err != nil {
			log.Error("failed to get role: ", err)
			return err
		}
		log.Info("Got full Role with name: ", createdRole.ID)

		// Create Subgroup with same name
		subgroup := gocloak.Group{
			Name: &roleName,
		}
		subgroupID, err := client.CreateChildGroup(ctx, token.AccessToken, config.Realm, baseGroupID, subgroup)
		if err != nil {
			log.Error("failed to create subgroup ", err)
			return err
		}

		log.Info("Subgroup group ID: ", subgroupID)

		// Associate role with group
		err = client.AddRealmRoleToGroup(ctx, token.AccessToken, config.Realm, subgroupID, []gocloak.Role{*createdRole})
		if err != nil {
			log.Error("failed to associate role with group: ", err)
			return err
		}
	}
	return nil
}
