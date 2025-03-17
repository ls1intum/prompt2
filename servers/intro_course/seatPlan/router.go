package seatPlan

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/keycloakTokenVerifier"
	"github.com/ls1intum/prompt2/servers/intro_course/seatPlan/seatPlanDTO"
	log "github.com/sirupsen/logrus"
)

func setupSeatPlanRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	seatPlanRouter := router.Group("/seat_plan")

	// Post initial seat plan with seat names
	seatPlanRouter.POST("", authMiddleware(keycloakTokenVerifier.PromptAdmin, keycloakTokenVerifier.CourseLecturer), createSeatPlan)
	seatPlanRouter.DELETE("", authMiddleware(keycloakTokenVerifier.PromptAdmin, keycloakTokenVerifier.CourseLecturer), deleteSeatPlan)

	// Update seat plan (assigned tutor, assigned student, hasMac, deviceID)
	seatPlanRouter.PUT("", authMiddleware(keycloakTokenVerifier.PromptAdmin, keycloakTokenVerifier.CourseLecturer), updateSeatPlan)

	seatPlanRouter.GET("", authMiddleware(keycloakTokenVerifier.PromptAdmin, keycloakTokenVerifier.CourseLecturer), getSeatPlan)

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

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
