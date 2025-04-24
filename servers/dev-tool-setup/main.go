package main

import (
	"github.com/spf13/viper"
	g "gitlab.com/gitlab-org/api/client-go"
	gitlab "github.com/ls1intum/prompt2/servers/dev-tool-setup/gitlab_setup"
	log "github.com/sirupsen/logrus"
)

type iPraktikumTeams struct {
	// The teams
	Teams []iPraktikumTeam
	// The semester group name
	SemesterGroupName string
}

type iPraktikumTeam struct {
	// The team name
	TeamName string
	// The team members
	TeamMembers []TeamMember
	// The team coach
	TeamCoach TeamMember
	// The team product owner
	TeamProjectLead TeamMember

	// The team projectID
	GitlabGroup g.Group	
}

type TeamMember struct {
	// The username of the team member
	Username string
}

type gitlabUser struct {
	TeamMember
	// The GitLab user ID
	UserID int
}

func loadConfig() (gitlab.GitlabConfig, error) {
    viper.SetConfigFile(".env")
    viper.AutomaticEnv()

    if err := viper.ReadInConfig(); err != nil {
        return gitlab.GitlabConfig{}, err
    }

    return gitlab.GitlabConfig{
        AccessToken:    viper.GetString("GITLAB_ACCESS_TOKEN"),
        BaseURL:        viper.GetString("GITLAB_BASE_URL"),
        ParentGroupID:  viper.GetInt("GITLAB_PARENT_GROUP_ID"),
    }, nil
}

func main() {
    gitlabconfig, err := loadConfig()
    if err != nil {
        log.Fatal("Failed to load configuration: ", err)
    }


	semester := iPraktikumTeams{
		SemesterGroupName: "iOS25",
		Teams: []iPraktikumTeam{
			{
				TeamName: "iOS25-1",
				TeamMembers: []TeamMember{
					{Username: "user1"},
					{Username: "user2"},
				},
				TeamCoach: TeamMember{Username: "coach1"},
				TeamProjectLead: TeamMember{Username: "lead1"},
			},
			{
				TeamName: "iOS25-2",
				TeamMembers: []TeamMember{
					{Username: "user3"},
					{Username: "user4"},
				},
				TeamCoach: TeamMember{Username: "coach2"},
				TeamProjectLead: TeamMember{Username: "lead2"},
			},
		},
	}

	gitlabClient, err := gitlab.GetClient(gitlabconfig)
	if err != nil {
		log.Fatal("Failed to create GitLab client: ", err)
	}

	// 2. Ensure that the semester group exists
	gitlab.CreateGroupWithParentID(gitlabClient, gitlabconfig.ParentGroupID, semester.SemesterGroupName)

	// 3. Create a group for every team
	for _, team := range semester.Teams {
		group, err := gitlab.CreateGroupWithParentID(gitlabClient, gitlabconfig.ParentGroupID, team.TeamName)
		if err != nil {
			log.Error("Failed to create group: ", err)
			continue
		}
		team.GitlabGroup = *group
		log.Info("Created group: ", group.Name)
	}

	// 4. Add team members as developers to the group
	// for _, team := range semester.Teams {
	// 	group, err := gitlab.GetGroupByName(gitlabClient, team.TeamName)
	// 	if err != nil {
	// 		log.Error("Failed to get group: ", err)
	// 		continue
	// 	}
	// 	for _, member := range team.TeamMembers {
	// 		user, err := gitlab.GetUserByUsername(gitlabClient, member.Username)
	// 		if err != nil {
	// 			log.Error("Failed to get user: ", err)
	// 			continue
	// 		}
	// 		err = gitlab.AddUserToGroup(gitlabClient, group, user, gitlab.DeveloperAccessLevel)
	// 		if err != nil {
	// 			log.Error("Failed to add user: ", err)
	// 			continue
	// 		}
	// 		log.Info("Added user: ", user.Username, " to group: ", group.Name)
	// 	}
	// }
	// 5. Add coach and PL as owners to the group
	// 6. Create a project for every team

}
