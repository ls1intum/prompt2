package gitlab_setup

import (
	log "github.com/sirupsen/logrus"
	gitlab "gitlab.com/gitlab-org/api/client-go"
)

type GitlabConfig struct {
	AccessToken   string
	BaseURL       string
	ParentGroupID int
}

func GetClient(conf GitlabConfig) (*gitlab.Client, error) {
	// Create a client
	git, err := gitlab.NewClient(conf.AccessToken, gitlab.WithBaseURL(conf.BaseURL))
	if err != nil {
		log.Error("Failed to create client: ", err)
		return nil, err
	}
	return git, nil

}
