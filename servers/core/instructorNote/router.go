package instructorNote

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/instructorNote/instructorNoteDTO"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
	"github.com/ls1intum/prompt2/servers/core/utils"
)

func setupInstructorNoteRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionRoleMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	instructorNoteRouter := router.Group("/instructor-notes", authMiddleware())
	instructorNoteRouter.GET("/", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.PromptLecturer), getAllInstructorNotes)
	instructorNoteRouter.GET("/s/:student-uuid", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.PromptLecturer), getInstructorNoteForStudentByID)
	instructorNoteRouter.POST("/s/:student-uuid", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.PromptLecturer), createInstructorNoteForStudentByID)
	instructorNoteRouter.DELETE("/:note-uuid", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.PromptLecturer), deleteInstructorNote)
}

// getAllInstructorNotes godoc
// @Summary Get all notes
// @Description Get all instructor notes with note versions
// @Tags instructorNotes
// @Produce json
// @Success 200 {object} []instructorNoteDTO.InstructorNote
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /instructor-notes [get]
func getAllInstructorNotes(c *gin.Context) {
	studentNotes, err := GetStudentNotes(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusOK, studentNotes)
}

// getInstructorNoteForStudentByID godoc
// @Summary Get all notes for a student
// @Description Get all instructor notes with note versions for a specific student, provided the student ID
// @Tags instructorNotes
// @Produce json
// @Param student-uuid path string true "Student UUID"
// @Success 200 {object} []instructorNoteDTO.InstructorNote
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /instructor-notes/s/{student-uuid} [get]
func getInstructorNoteForStudentByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("student-uuid"))
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	studentNotes, err := GetStudentNotesByID(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusOK, studentNotes)
}


// createInstructorNoteForStudentByID godoc
// @Summary Create an instructor Note for a student
// @Description Create a new instructor note or a new edit for a specific student given its ID
// @Tags instructorNotes
// @Produce json
// @Param student-uuid path string true "Student UUID"
// @Success 200 {object} []instructorNoteDTO.InstructorNote
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /instructor-notes/s/{student-uuid} [post]
func createInstructorNoteForStudentByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("student-uuid"))
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	var newNote instructorNoteDTO.CreateInstructorNote
	if err := c.BindJSON(&newNote); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

  userID, err := utils.GetUserUUIDFromContext(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

  authorName := utils.GetUserNameFromContext(c)
  authorEmail := utils.GetUserEmailFromContext(c)

	// validate Request
	if err := ValidateCreateNote(newNote); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	if err := ValidateReferencedNote(newNote, c, userID); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

  NewStudentNote(c, id, newNote, userID, authorName, authorEmail)

	studentNotes, err := GetStudentNotesByID(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusOK, studentNotes)
}


// deleteInstructorNote godoc
// @Summary Delete an instructor Note
// @Description Delete an instructor note by UUID
// @Tags instructorNotes
// @Produce json
// @Param note-uuid path string true "Note UUID"
// @Success 200 {object} instructorNoteDTO.InstructorNote
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /instructor-notes/{note-uuid} [delete]
func deleteInstructorNote(c *gin.Context) {
  note_id, err := uuid.Parse(c.Param("note-uuid"))
  if err != nil {
    handleError(c, http.StatusBadRequest, err)
    return
  }

  userID, err := utils.GetUserUUIDFromContext(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

  note, err := DeleteInstructorNote(c, note_id, userID)
  if err != nil {
    handleError(c, http.StatusInternalServerError, err)
    return
  }

  c.IndentedJSON(http.StatusOK, note)
}



func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, utils.ErrorResponse{
		Error: err.Error(),
	})
}

