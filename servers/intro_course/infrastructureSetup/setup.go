package infrastructureSetup

import (
	log "github.com/sirupsen/logrus"
	gitlab "gitlab.com/gitlab-org/api/client-go"
)

const CI_CD_PROJECT_ID = 190739
const TOP_LEVEL_GROUP_NAME = "ase/ipraktikum"

func getClient() (*gitlab.Client, error) {
	// Create a client
	git, err := gitlab.NewClient("yourtokengoeshere", gitlab.WithBaseURL("https://gitlab.lrz.de/api/v4"))
	if err != nil {
		log.Error("Failed to create client: ", err)
		return nil, err
	}
	return git, nil

}

func createCourseIterationGroupTag(courseIteration string) (*gitlab.Group, error) {
	// Create a top level group
	git, err := getClient()
	if err != nil {
		return nil, err
	}

	group, _, err := git.Groups.CreateGroup(&gitlab.CreateGroupOptions{
		Name:                  gitlab.Ptr(courseIteration),
		Path:                  gitlab.Ptr(path),
		ProjectCreationLevel:  gitlab.Ptr(gitlab.MaintainerProjectCreation),
		SubGroupCreationLevel: gitlab.Ptr(gitlab.MaintainerSubGroupCreationLevelValue),
		AutoDevopsEnabled:     gitlab.Ptr(false),
	})
	if err != nil {
		log.Error("failed to create course iteration group: ", err)
		return nil, err
	}

	return group, nil
}

func createDeveloperTopLevelGroup(parentGroupID *int) (*gitlab.Group, error) {
	return createGitlabGroup(parentGroupID, "developer", gitlab.NoOneProjectCreation, gitlab.OwnerSubGroupCreationLevelValue)
}

// create Groups for tutors and coaches
func createTeachingGroup(parentGroupID *int, groupName string) (*gitlab.Group, error) {
	return createGitlabGroup(parentGroupID, groupName, gitlab.DeveloperProjectCreation, gitlab.OwnerSubGroupCreationLevelValue)
}

func createGitlabGroup(parentGroupID int, groupName string, projectCreationLevel gitlab.ProjectCreationLevelValue, subGroupCreationLevel gitlab.SubGroupCreationLevelValue) (*gitlab.Group, error) {
	// Create a top level group
	git, err := getClient()
	if err != nil {
		log.Error("failed to create group: ", groupName, " due to failed client creation")
		return nil, err
	}

	// Create a group
	group, _, err := git.Groups.CreateGroup(&gitlab.CreateGroupOptions{
		Name:                  gitlab.Ptr(groupName),
		ParentID:              gitlab.Ptr(parentGroupID),
		ProjectCreationLevel:  gitlab.Ptr(projectCreationLevel),
		SubGroupCreationLevel: gitlab.Ptr(subGroupCreationLevel),
		AutoDevopsEnabled:     gitlab.Ptr(false),
	})

	if err != nil {
		log.Error("failed to create developer group: ", err)
		return nil, err
	}

	return group, nil
}

func grantGroupAccessToCICDProject(groupID *int) {
	// TODO get ci-cd project id dynamically
	git, err := getClient()
	if err != nil {
		log.Error("failed to grant group access to CICD project: ", err)
		return
	}

	access := gitlab.ReporterPermissions
	opt := &gitlab.ShareWithGroupOptions{
		GroupID:     groupID,
		GroupAccess: &access,
	}

	// Grant group access to CICD project
	_, err = git.Projects.ShareProjectWithGroup(CI_CD_PROJECT_ID, opt)
	if err != nil {
		log.Error("failed to grant group access to CICD project: ", err)
		return
	}
}

func getUserID(username string) (*gitlab.User, error) {
	git, err := getClient()
	if err != nil {
		log.Error("failed to get user id: ", err)
		return nil, err
	}

	userOpts := &gitlab.ListUsersOptions{
		Username: gitlab.Ptr(username),
	}

	users, _, err := git.Users.ListUsers(userOpts)
	if err != nil {
		log.Error("failed to get user id: ", err)
		return nil, err
	}

	if len(users) != 1 {
		log.Error("failed to get user id: user not found")
		return nil, err
	}
	return users[0], nil
}

func CreateStudentProject(devTumID string, devID, tutorID int, devGroupID *int) {
	git, err := getClient()
	if err != nil {
		log.Error("failed to grant group access to CICD project: ", err)
		return
	}

	p := &gitlab.CreateProjectOptions{
		Name:                             gitlab.Ptr(devTumID),
		SharedRunnersEnabled:             gitlab.Ptr(true),
		OnlyAllowMergeIfPipelineSucceeds: gitlab.Ptr(true),
		BuildsAccessLevel:                gitlab.Ptr(gitlab.PrivateAccessControl),
		ContainerRegistryAccessLevel:     gitlab.Ptr(gitlab.DisabledAccessControl),
		EnvironmentsAccessLevel:          gitlab.Ptr(gitlab.DisabledAccessControl),
		FeatureFlagsAccessLevel:          gitlab.Ptr(gitlab.DisabledAccessControl),
		ForkingAccessLevel:               gitlab.Ptr(gitlab.DisabledAccessControl),
		InfrastructureAccessLevel:        gitlab.Ptr(gitlab.DisabledAccessControl),
		PackagesEnabled:                  gitlab.Ptr(false),
		ReleasesAccessLevel:              gitlab.Ptr(gitlab.DisabledAccessControl),
		SecurityAndComplianceAccessLevel: gitlab.Ptr(gitlab.DisabledAccessControl),
		SnippetsAccessLevel:              gitlab.Ptr(gitlab.DisabledAccessControl),
		WikiAccessLevel:                  gitlab.Ptr(gitlab.DisabledAccessControl),
	}

	project, _, err := git.Projects.CreateProject(p)
	if err != nil {
		log.Error("failed to create project: ", err)
		return
	}

	// Add student to the project
	_, _, err = git.ProjectMembers.AddProjectMember(project.ID, &gitlab.AddProjectMemberOptions{
		UserID:      gitlab.Ptr(devID),
		AccessLevel: gitlab.Ptr(gitlab.DeveloperPermissions),
	})
	if err != nil {
		log.Error("failed to add student to project: ", err)
		return
	}

	// Add student to the developer group
	_, _, err = git.GroupMembers.AddGroupMember(devGroupID, &gitlab.AddGroupMemberOptions{
		UserID:      gitlab.Ptr(devID),
		AccessLevel: gitlab.Ptr(gitlab.DeveloperPermissions),
	})
	if err != nil {
		log.Error("failed to add student to developer group: ", err)
		return
	}

	// Add tutor to the project
	_, _, err = git.ProjectMembers.AddProjectMember(project.ID, &gitlab.AddProjectMemberOptions{
		UserID:      gitlab.Ptr(tutorID),
		AccessLevel: gitlab.Ptr(gitlab.DeveloperPermissions),
	})
	if err != nil {
		log.Error("failed to add tutor to project: ", err)
		return
	}

	// Add MR approval rule
	// TODO
	approvalRuleOptions := gitlab.CreateMergeRequestApprovalRuleOptions{
		Name:                  gitlab.Ptr("Tutor Approval"),
		ApprovalsRequired:     gitlab.Ptr(1),
		ApprovalProjectRuleID: gitlab.Ptr(project.ID),
		UserIDs:               gitlab.Ptr([]int{tutorID}),
	}

	// Add branch protection
	git.Branches.ProtectBranch(project.ID, "main", &gitlab.ProtectBranchOptions{
		DevelopersCanPush:  gitlab.Ptr(false),
		DevelopersCanMerge: gitlab.Ptr(true),
	})
}
