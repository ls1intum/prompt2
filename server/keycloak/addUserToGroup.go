package keycloak

import (
	"context"
	"fmt"

	"github.com/Nerzal/gocloak/v13"
	log "github.com/sirupsen/logrus"
)

func AddUserToGroup(ctx context.Context, userID, realm, groupName string) error {
	token, err := LoginClient(ctx)
	if err != nil {
		return err
	}
	// Pass the name as a query parameter
	exact := true
	params := gocloak.GetGroupsParams{
		Search: &groupName,
		Exact:  &exact,
	}

	// Retrieve groups with the search parameter
	groups, err := KeycloakSingleton.client.GetGroups(ctx, token.AccessToken, realm, params)
	if err != nil {
		log.Error("Failed to retrieve groups: ", err)
	}

	// Check if any group matches and get the ID
	if len(groups) == 0 || len(groups) > 1 || groups[0] == nil {
		log.Error("Error while looking up groups with name: ", groupName)
	}

	// Keycloak always returns the "root" group (even if it is a subgroup)
	// Check if the group is the subgroup
	var groupId string = ""
	if groups[0].Name != nil && groups[0].Name == &groupName {
		groupId = *groups[0].ID
	} else {
		// check in the subgroups
		if groups[0].SubGroups != nil {
			for _, subGroup := range *groups[0].SubGroups {
				if subGroup.Name != nil && *subGroup.Name == groupName {
					groupId = *subGroup.ID
					break
				}
			}
		}
	}

	if groupId == "" {
		log.Error("Group not found with name: ", groupName)
		return fmt.Errorf("group not found with name: %s", groupName)
	}

	err = KeycloakSingleton.client.AddUserToGroup(ctx, token.AccessToken, KeycloakSingleton.Realm, userID, groupId)
	if err != nil {
		log.Error("failed to add user to group: ", err)
		return err
	}
	return nil
}
