package survey

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/team_allocation/survey/surveyDTO"
	log "github.com/sirupsen/logrus"
)

// SetupSurveyRouter sets up survey endpoints under /survey.
func setupSurveyRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	surveyRouter := routerGroup.Group("/survey")
	// Endpoints accessible to CourseStudents.
	surveyRouter.GET("/available", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseStudent), getAvailableSurveyData)
	surveyRouter.GET("/answers", authMiddleware(promptSDK.CourseStudent), getStudentSurveyResponses)
	surveyRouter.POST("/answers", authMiddleware(promptSDK.CourseStudent), submitSurveyResponses)

	surveyRouter.PUT("/timeframe", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), setSurveyTimeframe)
	surveyRouter.GET("/timeframe", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getSurveyTimeframe)

}

// getAvailableSurveyData returns teams and skills if the survey has started.
// Expects coursePhaseID to be provided as a query parameter.
func getAvailableSurveyData(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	surveyData, err := GetAvailableSurveyData(c, coursePhaseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, surveyData)
}

// getStudentSurveyResponses returns the student's submitted survey answers.
// Expects courseParticipationID to be provided as a query parameter.
func getStudentSurveyResponses(c *gin.Context) {
	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		log.Error("Error parsing courseParticipationID: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	responses, err := GetStudentSurveyResponses(c, courseParticipationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, responses)
}

// submitSurveyResponses accepts and stores (or overwrites) the student's survey answers.
// Expects courseParticipationID and coursePhaseID as query parameters.
func submitSurveyResponses(c *gin.Context) {
	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		log.Error("Error parsing courseParticipationID: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var submission surveyDTO.StudentSurveyResponse
	if err := c.BindJSON(&submission); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = SubmitSurveyResponses(c, courseParticipationID, coursePhaseID, submission)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

// setSurveyTimeframe allows lecturers to set or update the survey timeframe.
// Expects coursePhaseID as a query parameter and the new timeframe in the JSON body.
func setSurveyTimeframe(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var req surveyDTO.SurveyTimeframe
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = SetSurveyTimeframe(c, coursePhaseID, req.SurveyStart, req.SurveyDeadline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func getSurveyTimeframe(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	timeframe, err := GetSurveyTimeframe(c, coursePhaseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, timeframe)
}
