package gitlab_setup

import (
	log "github.com/sirupsen/logrus"
	gitlab "gitlab.com/gitlab-org/api/client-go"
)

func CreateProject(client *gitlab.Client, projectName string, group gitlab.Group) error {
	groupOptions := &gitlab.CreateProjectOptions{
		Name:        gitlab.Ptr(projectName),
		NamespaceID: gitlab.Ptr(group.ID),
	}

	project, _, err := client.Projects.CreateProject(groupOptions)
	if err != nil {
		log.Error("failed to create project: ", err)
		return err
	}

	log.Info("Project created: ", project.Name, " in group: ", group.Name)

	return nil
}
