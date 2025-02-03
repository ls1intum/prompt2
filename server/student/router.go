package student

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/keycloakRealmManager"
	"github.com/niclasheun/prompt2.0/student/studentDTO"
)

func setupStudentRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionRoleMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	student := router.Group("/students", authMiddleware())
	student.GET("/", permissionRoleMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.PromptLecturer), getAllStudents)
	student.GET("/:uuid", permissionRoleMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.PromptLecturer), getStudentByID)
	student.POST("/", permissionRoleMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.PromptLecturer), createStudent)
	student.PUT("/:uuid", permissionRoleMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.PromptLecturer), updateStudent)
	student.GET("/search/:searchString", permissionRoleMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.PromptLecturer), searchStudents)
}

func getAllStudents(c *gin.Context) {
	students, err := GetAllStudents(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, students)
}

func getStudentByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	student, err := GetStudentByID(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusOK, student)
}

func createStudent(c *gin.Context) {
	var newStudent studentDTO.CreateStudent
	if err := c.BindJSON(&newStudent); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// validate student
	if err := Validate(newStudent); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	student, err := CreateStudent(c, nil, newStudent)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusCreated, student)
}

func updateStudent(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var updateStudent studentDTO.CreateStudent
	if err := c.BindJSON(&updateStudent); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// make sure that the UUID matches
	if id != updateStudent.ID {
		handleError(c, http.StatusBadRequest, errors.New("UUID in URL does not match UUID in body"))
		return
	}

	// validate student
	if err := Validate(updateStudent); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	student, err := UpdateStudent(c, nil, id, updateStudent)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, student)
}

func searchStudents(c *gin.Context) {
	searchString := c.Param("searchString")

	students, err := SearchStudents(c, searchString)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusOK, students)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
