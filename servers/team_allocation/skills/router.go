package skills

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/team_allocation/skills/skillDTO"
	log "github.com/sirupsen/logrus"
)

// setupSkillRouter creates a router group for skill endpoints.
func setupSkillRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	skillRouter := routerGroup.Group("/skill")

	skillRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getAllSkills)
	skillRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), createSkills)
	skillRouter.PUT("/:skillID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), updateSkill)
	skillRouter.DELETE("/:skillID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), deleteSkill)
}

func getAllSkills(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	skills, err := GetAllSkills(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, skills)
}

func createSkills(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var request skillDTO.CreateSkillsRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = CreateNewSkills(c, request.SkillNames, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusCreated)
}

func updateSkill(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	skillID, err := uuid.Parse(c.Param("skillID"))
	if err != nil {
		log.Error("Error parsing skillID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var request skillDTO.UpdateSkillRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateSkill(c, coursePhaseID, skillID, request.NewSkillName)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func deleteSkill(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	skillID, err := uuid.Parse(c.Param("skillID"))
	if err != nil {
		log.Error("Error parsing skillID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = DeleteSkill(c, coursePhaseID, skillID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
