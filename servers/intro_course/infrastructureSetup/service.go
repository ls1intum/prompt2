package infrastructureSetup

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

func CreateCourseInfrastructure(c *gin.Context, coursePhaseID uuid.UUID, semesterTag string) error {
	// 1.) Get Top Level Group
	aseGroup, err := getGroup("ipraktikumTest")
	if err != nil {
		log.Error("Failed to get group: ", err)
		return err
	}

	// // 2.) Get iPraktikum Group
	ipraktikumGroup, err := getSubGroup("ipraktikum", aseGroup.ID)
	if err != nil {
		log.Error("Failed to get group: ", err)
		return err
	}
	log.Info("Got iPraktikum group: ", ipraktikumGroup.Name)

	courseGroup, err := createCourseIterationGroup(semesterTag, ipraktikumGroup.ID)
	if err != nil {
		log.Error("Failed to create course iteration group: ", err)
		return err
	}

	log.Info("Created course group: ", courseGroup.ID)

	// 2.) Create the developer group
	_, err = createDeveloperTopLevelGroup(courseGroup.ID)
	if err != nil {
		log.Error("Failed to create developer group: ", err)
	}

	// 3.) Create the tutor groups
	_, err = createTeachingGroup(courseGroup.ID, "tutor")
	if err != nil {
		log.Error("Failed to create tutor group: ", err)
	}

	// 4.) Create the coach group
	_, err = createTeachingGroup(courseGroup.ID, "coach")
	if err != nil {
		log.Error("Failed to create coach group: ", err)
	}

	// 5.) Create the introCourse group
	_, err = createTeachingGroup(courseGroup.ID, "introCourse")
	if err != nil {
		log.Error("Failed to create introCourse group: ", err)
	}

	// // 6.) Grant dev group access to ci/cd project
	// err = grantGroupAccessToCICDProject(developerGroup.ID)
	// if err != nil {
	// 	log.Error("Failed to grant access to project: ", err)
	// }

	// // 7.) Grant tutor group access to ci/cd project
	// err = grantGroupAccessToCICDProject(tutorGroup.ID)
	// if err != nil {
	// 	log.Error("Failed to grant access to project: ", err)
	// }

	return nil
}
