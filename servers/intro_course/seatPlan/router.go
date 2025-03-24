package seatPlan

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/intro_course/seatPlan/seatPlanDTO"
	log "github.com/sirupsen/logrus"
)

func setupSeatPlanRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	seatPlanRouter := router.Group("/seat_plan")

	// Post initial seat plan with seat names
	seatPlanRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), createSeatPlan)
	seatPlanRouter.DELETE("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), deleteSeatPlan)

	// Update seat plan (assigned tutor, assigned student, hasMac, deviceID)
	seatPlanRouter.PUT("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), updateSeatPlan)

	seatPlanRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getSeatPlan)

	seatPlanRouter.GET("/own-assignment", authMiddleware(keycloakTokenVerifier.CourseStudent), getOwnSeatAssignment)

}

func createSeatPlan(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var seatNames []string
	if err := c.BindJSON(&seatNames); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// validate uniqueness of seat names
	unique := validateSeatNames(seatNames)
	if !unique {
		handleError(c, http.StatusBadRequest, errors.New("seat names must be unique"))
		return
	}

	err = CreateSeatPlan(c, coursePhaseID, seatNames)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusCreated)
}

func getSeatPlan(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	seats, err := GetSeatPlan(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, seats)
}

func updateSeatPlan(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var seats []seatPlanDTO.Seat
	if err := c.BindJSON(&seats); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateSeatPlan(c, coursePhaseID, seats)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusOK)
}

func deleteSeatPlan(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = DeleteSeatPlan(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusOK)
}

func getOwnSeatAssignment(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, ok := c.Get("courseParticipationID")
	if !ok {
		log.Error("Error getting courseParticipationID from context")
		handleError(c, http.StatusInternalServerError, errors.New("error getting courseParticipationID from context"))
		return
	}

	seatAssignment, err := GetOwnSeatAssignment(c, coursePhaseID, courseParticipationID.(uuid.UUID))

	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, seatAssignment)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
