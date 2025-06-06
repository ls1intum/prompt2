package gitlab_setup

import (
	"errors"

	log "github.com/sirupsen/logrus"
	gitlab "gitlab.com/gitlab-org/api/client-go"
)

func CreateGroupWithParentGroup(client *gitlab.Client, parentGroup gitlab.Group, groupName string) (*gitlab.Group, error) {
	return CreateGroupWithParentID(client, parentGroup.ID, groupName)
}

func CreateGroupWithParentID(client *gitlab.Client, parentGroupID int, groupName string) (*gitlab.Group, error) {
	exists, group, err := CheckIfSubGroupExists(client, groupName, parentGroupID)
	if err != nil {
		log.Error("Failed to create course iteration group: ", err)
		return nil, err
	}

	if exists {
		return group, nil
	}

	group, _, err = client.Groups.CreateGroup(&gitlab.CreateGroupOptions{
		Name:                  gitlab.Ptr(groupName),
		ParentID:              gitlab.Ptr(parentGroupID),
		ProjectCreationLevel:  gitlab.Ptr(gitlab.DeveloperProjectCreation),
		SubGroupCreationLevel: gitlab.Ptr(gitlab.OwnerSubGroupCreationLevelValue),
		AutoDevopsEnabled:     gitlab.Ptr(false),
		Path:                  gitlab.Ptr(groupName),
	})

	if err != nil {
		log.Error("Failed to create developer group: ", err)
		return nil, err
	}

	return group, nil
}

func CheckIfSubGroupExists(client *gitlab.Client, groupName string, parentGroupID int) (bool, *gitlab.Group, error) {
	groups, _, err := client.Groups.ListSubGroups(parentGroupID, &gitlab.ListSubGroupsOptions{
		Search:       gitlab.Ptr(groupName),
		AllAvailable: gitlab.Ptr(true),
	})
	if err != nil {
		log.Error("Failed to get group: ", err)
		return false, nil, err
	}

	for _, group := range groups {
		log.Debug("Found group: ", group.Name, " parent: ", group.ParentID)
		if group.Name == groupName && group.ParentID == parentGroupID {
			return true, group, nil
		}
	}
	return false, nil, nil
}

func AddUserToGroup(client *gitlab.Client, group gitlab.Group, user gitlab.User, accessLevel gitlab.AccessLevelValue) error {
	log.Debug("Adding user: ", user.Username, " to group: ", group.Name, " with access level: ", accessLevel)

	_, _, err := client.GroupMembers.AddGroupMember(group.ID, &gitlab.AddGroupMemberOptions{
		UserID:      gitlab.Ptr(user.ID),
		AccessLevel: gitlab.Ptr(accessLevel),
	})
	if err != nil {
		log.Error("Failed to add user: ", user.Username, " to group: ", group.Name, " with error: ", err)
		return err
	}

	return nil
}

func GetUserID(client *gitlab.Client, username string) (*gitlab.User, error) {
	userOpts := &gitlab.ListUsersOptions{
		Username: gitlab.Ptr(username),
	}

	users, _, err := client.Users.ListUsers(userOpts)
	if err != nil {
		log.Error("Failed to get user with username : ", username, ", error: ", err)
		return nil, err
	}

	if len(users) != 1 || users[0] == nil {
		log.Error("Failed to get user id for user: ", username, " user not found")
		return nil, errors.New("user not found")
	}
	return users[0], nil
}
