package main

import (
	gitlab "github.com/ls1intum/prompt2/servers/dev-tool-setup/gitlab_setup"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	g "gitlab.com/gitlab-org/api/client-go"
)

type iPraktikumTeams struct {
	Teams             []iPraktikumTeam
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
	Username string
}

type conf struct {
	logLevel string
}

var config = conf{
	logLevel: "info",
}

func loadConfig() (gitlab.GitlabConfig, error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return gitlab.GitlabConfig{}, err
	}

	config.logLevel = viper.GetString("LOG_LEVEL")

	return gitlab.GitlabConfig{
		AccessToken:   viper.GetString("GITLAB_ACCESS_TOKEN"),
		BaseURL:       viper.GetString("GITLAB_BASE_URL"),
		ParentGroupID: viper.GetInt("GITLAB_PARENT_GROUP_ID"),
	}, nil
}

func main() {
	gitlabconfig, err := loadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration: ", err)
	}

	if config.logLevel == "debug" {
		log.SetLevel(log.DebugLevel)
	}

	semester := iPraktikumTeams{
		SemesterGroupName: "iOS25",
		Teams: []iPraktikumTeam{
			{
				Name: "iOS25-1",
				Members: []TeamMember{
					{Username: "mtze"},
				},
				Coach:       TeamMember{Username: "ge25hok"},
				ProjectLead: TeamMember{Username: "ge64fef"},
			},
			{
				Name: "iOS25-2",
				Members: []TeamMember{
					{Username: "ge63sir"},
				},
				Coach:       TeamMember{Username: "ge64fef"},
				ProjectLead: TeamMember{Username: "ge35qis"},
			},
		},
	}

	gitlabClient, err := gitlab.GetClient(gitlabconfig)
	if err != nil {
		log.Fatal("Failed to create GitLab client: ", err)
	}

	// 2. Ensure that the semester group exists
	semesterGroup, err := gitlab.CreateGroupWithParentID(gitlabClient, gitlabconfig.ParentGroupID, semester.SemesterGroupName)
	if err != nil {
		log.Error("Failed to create semester group: ", err)
		return
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
			log.Debug("Searching ", member.Username, " to add to group: ", team.GitlabGroup.Name)
			user, err := gitlab.GetUserID(gitlabClient, member.Username)
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
		coach, err := gitlab.GetUserID(gitlabClient, team.Coach.Username)
		if err != nil {
			log.Error("Could not add coach for team: ", team.Name, " with error.")
		} else {
			_ = gitlab.AddUserToGroup(gitlabClient, team.GitlabGroup, *coach, g.OwnerPermissions)
		}
		pl, err := gitlab.GetUserID(gitlabClient, team.ProjectLead.Username)
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

}
