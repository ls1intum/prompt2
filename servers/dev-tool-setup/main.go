package main

import (
	"strings"

	confluence "github.com/ls1intum/prompt2/servers/dev-tool-setup/confluence_setup"
	gitlab "github.com/ls1intum/prompt2/servers/dev-tool-setup/gitlab_setup"
	jira "github.com/ls1intum/prompt2/servers/dev-tool-setup/jira_setup"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	g "gitlab.com/gitlab-org/api/client-go"
)

type iPraktikumTeams struct {
	// The teams for the semester
	Teams []iPraktikumTeam

	// The prefix for the group names - this should be in lowercase - e.g. "ios25"
	Prefix string

	// The name of the semester group - this should be in spelled correctly  - e.g. "iOS25"
	SemesterGroupName string
}

type iPraktikumTeam struct {
	Name        string
	Members     []TeamMember
	Coach       TeamMember
	ProjectLead TeamMember

	GitlabGroup g.Group
}

type TeamMember struct {
	GitlabUsername string
	JiraUsername   string
}

type conf struct {
	logLevel string
}

var config = conf{
	logLevel: "info",
}

func loadConfig() (gitlab.GitlabConfig, jira.JiraClient, confluence.ConfluenceClient, error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return gitlab.GitlabConfig{}, jira.JiraClient{}, confluence.ConfluenceClient{}, err
	}

	config.logLevel = viper.GetString("LOG_LEVEL")

	gitlabconf := gitlab.GitlabConfig{
		AccessToken:   viper.GetString("GITLAB_ACCESS_TOKEN"),
		BaseURL:       viper.GetString("GITLAB_BASE_URL"),
		ParentGroupID: viper.GetInt("GITLAB_PARENT_GROUP_ID"),
	}

	jiraconf := jira.JiraClient{
		BaseURL:  viper.GetString("JIRA_BASE_URL"),
		Username: viper.GetString("ATLASSIAN_USERNAME"),
		APIToken: viper.GetString("ATLASSIAN_API_TOKEN"),
	}

	confluenceconf := confluence.ConfluenceClient{
		BaseURL:  viper.GetString("CONFLUENCE_BASE_URL"),
		Username: viper.GetString("ATLASSIAN_USERNAME"),
		APIToken: viper.GetString("ATLASSIAN_API_TOKEN"),
	}

	return gitlabconf, jiraconf, confluenceconf, nil
}

func main() {
	gitlabconfig, jiraconfig, confluenceconfig, err := loadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration: ", err)
	}

	if config.logLevel == "debug" {
		log.SetLevel(log.DebugLevel)
	}

	// TODO: Add correnct input data from somewhere
	semester := iPraktikumTeams{
		SemesterGroupName: "iOS25",
		Prefix:            "ios25",
		Teams: []iPraktikumTeam{
			{
				Name: "mtzetest",
				Members: []TeamMember{
					{GitlabUsername: "mtze", JiraUsername: "ga58roj"},
				},
				Coach:       TeamMember{GitlabUsername: "ge25hok", JiraUsername: "ge25hok"},
				ProjectLead: TeamMember{GitlabUsername: "ge64fef", JiraUsername: "ge64fef"},
			},
			// {
			// 	Name: "iOS25-2",
			// 	Members: []TeamMember{
			// 		{GitlabUsername: "ge63sir"},
			// 	},
			// 	Coach:       TeamMember{GitlabUsername: "ge64fef"},
			// 	ProjectLead: TeamMember{GitlabUsername: "ge35qis"},
			// },
		},
	}
	_ = gitlabconfig
	_ = jiraconfig
	_ = confluenceconfig

	setupGitlab(gitlabconfig, semester)

	setupJira(jiraconfig, semester)

	setupConfluence(confluenceconfig, semester)

}

func setupConfluence(client confluence.ConfluenceClient, semester iPraktikumTeams) error {

	for _, team := range semester.Teams {
		spaceKey := strings.ToUpper(semester.Prefix + team.Name)
		spaceName := semester.SemesterGroupName + team.Name

		err := client.CreateSpace(spaceKey, spaceName)
		if err != nil {
			log.Errorf("Error creating space: %v", err)
		}

		// Set the space label - This does not work yet. Apparently, the API does not support setting labels for spaces. -> https://jira.atlassian.com/browse/CONFSERVER-54743
		// err = client.AddSpaceToCategory(spaceKey, "ios25")
		// if err != nil {
		// 	log.Errorf("Error setting space label: %v", err)
		// }

		// Grant permissions to the space
		err = client.AssignGroupPermissions(spaceKey, strings.ToLower(semester.Prefix+team.Name), confluence.UserPermissions)
		if err != nil {
			log.Errorf("Error granting permissions to group: %v", err)
		}
		log.Debugf("Permissions granted to group %s for space %s", strings.ToLower(semester.Prefix+team.Name), spaceKey)

		// Grant permissions to the coach and project lead
		err = client.AssignGroupPermissions(spaceKey, strings.ToLower(semester.Prefix+team.Name+"-mgmt"), confluence.AdminPermissions)
		if err != nil {
			log.Errorf("Error granting permissions to group: %v", err)
		}
		log.Debugf("Permissions granted to group %s for space %s", strings.ToLower(semester.Prefix+team.Name+"-mgmt"), spaceKey)

		// Grant permissions to the customers
		err = client.AssignGroupPermissions(spaceKey, strings.ToLower(semester.Prefix+team.Name+"-customers"), confluence.UserPermissions)
		if err != nil {
			log.Errorf("Error granting permissions to group: %v", err)
		}
		log.Debugf("Permissions granted to group %s for space %s", strings.ToLower(semester.Prefix+team.Name+"-customers"), spaceKey)

		// log.Infof("Space %s setup successfully", team.Name)
	}
	return nil
}

func setupJiraGroup(client jira.JiraClient, groupName string, Members []TeamMember) error {
	// Create the group
	err := client.CreateGroup(groupName)
	if err != nil {
		log.Fatalf("Error creating group: %v", err)
	}
	log.Infof("Group %s created successfully", groupName)

	// Add members to the group
	for _, member := range Members {
		err = client.AddUserToGroup(member.JiraUsername, groupName)
		if err != nil {
			log.Warn("Error adding user to group: ", err)
		}
		log.Infof("User %s added to group %s successfully", member.GitlabUsername, groupName)
	}

	return nil
}

func setupJira(client jira.JiraClient, semester iPraktikumTeams) error {

	// 1. Create a group for the semester
	err := client.CreateGroup(semester.SemesterGroupName)
	if err != nil {
		log.Fatalf("Error creating group: %v", err)
	}
	log.Info("Group created successfully: ", semester.SemesterGroupName)

	// 2. Create groups for every team and add members
	for _, team := range semester.Teams {

		// Create a group for the developers, management, and customers
		_ = setupJiraGroup(client, strings.ToLower(semester.Prefix+team.Name), team.Members)
		_ = setupJiraGroup(client, strings.ToLower(semester.Prefix+team.Name+"-mgmt"), []TeamMember{team.ProjectLead, team.Coach})
		_ = setupJiraGroup(client, strings.ToLower(semester.Prefix+team.Name+"-customers"), []TeamMember{})

		log.Infof("Project groups for team %s created successfully", team.Name)

	}

	return nil
}

func setupGitlab(gitlabconfig gitlab.GitlabConfig, semester iPraktikumTeams) error {
	gitlabClient, err := gitlab.GetClient(gitlabconfig)
	if err != nil {
		log.Fatal("Failed to create GitLab client: ", err)
	}

	// 2. Ensure that the semester group exists
	semesterGroup, err := gitlab.CreateGroupWithParentID(gitlabClient, gitlabconfig.ParentGroupID, semester.SemesterGroupName)
	if err != nil {
		log.Error("Failed to create semester group: ", err)
		return err
	}

	// 3. Create a group for every team
	for i, team := range semester.Teams {
		group, err := gitlab.CreateGroupWithParentID(gitlabClient, semesterGroup.ID, team.Name)
		if err != nil {
			log.Error("Failed to create group: ", err)
		}
		semester.Teams[i].GitlabGroup = *group
		log.Info("Group Available: ", group.Name, " with ID: ", group.ID)
	}

	// 4. Add team members as developers to the group
	for _, team := range semester.Teams {
		log.Debug("Adding team members to group: ", team.GitlabGroup.Name)

		for _, member := range team.Members {
			log.Debug("Searching ", member.GitlabUsername, " to add to group: ", team.GitlabGroup.Name)
			user, err := gitlab.GetUserID(gitlabClient, member.GitlabUsername)
			if err != nil {
				log.Error("Failed to get user: ", err)
				break
			}
			log.Debug("Found user: ", user.Username, " with ID: ", user.ID)

			log.Debug("Adding user: ", user.Username, " to group: ", team.GitlabGroup.Name)
			_ = gitlab.AddUserToGroup(gitlabClient, team.GitlabGroup, *user, g.DeveloperPermissions)

			log.Info("Added user: ", user.Username, " to group: ", team.GitlabGroup.Name)
		}

		// 5. Add coach and PL as owners to the group
		coach, err := gitlab.GetUserID(gitlabClient, team.Coach.GitlabUsername)
		if err != nil {
			log.Error("Could not add coach for team: ", team.Name, " with error.")
		} else {
			_ = gitlab.AddUserToGroup(gitlabClient, team.GitlabGroup, *coach, g.OwnerPermissions)
		}
		pl, err := gitlab.GetUserID(gitlabClient, team.ProjectLead.GitlabUsername)
		if err != nil {
			log.Error("Could not add pl for team: ", team.Name, " with error.")
		} else {
			_ = gitlab.AddUserToGroup(gitlabClient, team.GitlabGroup, *pl, g.OwnerPermissions)
		}

		// 6. Create a project for every team
		err = gitlab.CreateProject(gitlabClient, team.Name, team.GitlabGroup)
		if err != nil {
			log.Error("Failed to create project: ", err)
		} else {
			log.Info("Created project: ", team.Name, " in group: ", team.GitlabGroup.Name)
		}
	}
	return nil
}
