package allocations

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt-sdk/keycloakTokenVerifier"
	"github.com/ls1intum/prompt2/servers/team_allocation/allocations/allocationDTO"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

func setupAllocationsRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	allocationsRouter := routerGroup.Group("/allocations")

	// we need the keycloak middleware here to ensure that the user has a valid token
	allocationsRouter.GET("/course-phases", keycloakTokenVerifier.KeycloakMiddleware(), getAllCoursePhases)

	allocationsRouter.PUT("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), putAllocation)
	allocationsRouter.GET("/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getStudentAllocation)
	allocationsRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getAllAllocations)
}

func getAllCoursePhases(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	rolesVal, exists := c.Get("userRoles")
	if !exists {
		handleError(c, http.StatusForbidden, errors.New("missing user roles"))
		return
	}

	userRoles, ok := rolesVal.(map[string]bool)
	if !ok {
		handleError(c, http.StatusInternalServerError, errors.New("invalid user roles format"))
		return
	}

	teasePhases, err := GetTeamAllocationCoursePhases(
		c.Request.Context(),
		authHeader,
		userRoles,
	)

	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, teasePhases)
}

func getAllAllocations(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, errors.New("invalid course phase ID"))
		return
	}

	allocations, err := GetAllocationsByCoursePhase(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, allocations)
}

func getStudentAllocation(c *gin.Context) {
	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, errors.New("invalid course phase ID"))
		return
	}

	allocation, err := GetStudentAllocation(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, allocation)
}
func putAllocation(c *gin.Context) {
	var req allocationDTO.AllocationRequest

	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	arg := db.GetAllocationForStudentParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         req.CoursePhaseID,
	}
	_, err := AllocationsServiceSingleton.queries.GetAllocationForStudent(c, arg)
	allocationExists := err == nil

	err = PutAllocation(c, req.CourseParticipationID, req.TeamID, req.CoursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	if allocationExists {
		c.JSON(http.StatusOK, gin.H{"message": "Allocation updated successfully"})
	} else {
		c.JSON(http.StatusCreated, gin.H{"message": "Allocation created successfully"})
	}
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
