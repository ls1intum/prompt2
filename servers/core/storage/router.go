package storage

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
	log "github.com/sirupsen/logrus"
)

// setupStorageRouter sets up the storage endpoints
// @Summary Storage Endpoints
// @Description Endpoints for file upload, download, and management
// @Tags storage
// @Security BearerAuth
func setupStorageRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionRoleMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	storage := router.Group("/storage", authMiddleware())

	storage.POST("/presign-upload", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor, permissionValidation.CourseStudent), presignUpload)
	storage.POST("/complete-upload", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor, permissionValidation.CourseStudent), completeUpload)
	storage.GET("/files/:fileId", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor, permissionValidation.CourseStudent), getFile)
	storage.DELETE("/files/:fileId", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), deleteFile)

	storage.GET("/course-phases/:coursePhaseId/files", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getFilesByCoursePhase)
}

type presignUploadRequest struct {
	Filename      string `json:"filename"`
	ContentType   string `json:"contentType"`
	CoursePhaseID string `json:"coursePhaseId"`
	Description   string `json:"description"`
	Tags          string `json:"tags"`
}

type completeUploadRequest struct {
	StorageKey       string `json:"storageKey"`
	OriginalFilename string `json:"originalFilename"`
	ContentType      string `json:"contentType"`
	CoursePhaseID    string `json:"coursePhaseId"`
	Description      string `json:"description"`
	Tags             string `json:"tags"`
}

// presignUpload godoc
// @Summary Create a presigned upload URL
// @Description Returns a presigned URL for uploading a file directly to storage
// @Tags storage
// @Accept json
// @Produce json
// @Success 200 {object} PresignUploadResponse
// @Failure 400 {object} gin.H
// @Failure 403 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /storage/presign-upload [post]
func presignUpload(c *gin.Context) {
	var body presignUploadRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if _, ok := getUserID(c); !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	var coursePhaseID *uuid.UUID
	if body.CoursePhaseID != "" {
		phaseID, err := uuid.Parse(body.CoursePhaseID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course phase ID"})
			return
		}
		coursePhaseID = &phaseID

		if !ensureCoursePhaseAccess(c, phaseID, permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor, permissionValidation.CourseStudent) {
			return
		}
	} else {
		if !hasRole(c, permissionValidation.PromptAdmin) {
			c.JSON(http.StatusForbidden, gin.H{"error": "course phase ID required"})
			return
		}
	}

	tags := parseTags(body.Tags)
	req := PresignUploadRequest{
		Filename:      body.Filename,
		ContentType:   body.ContentType,
		CoursePhaseID: coursePhaseID,
		Description:   body.Description,
		Tags:          tags,
	}

	response, err := StorageServiceSingleton.PresignUpload(c.Request.Context(), req)
	if err != nil {
		log.WithError(err).Error("Failed to presign upload")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// completeUpload godoc
// @Summary Complete a presigned upload
// @Description Registers an uploaded file after a presigned upload completes
// @Tags storage
// @Accept json
// @Produce json
// @Success 201 {object} FileResponse
// @Failure 400 {object} gin.H
// @Failure 403 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /storage/complete-upload [post]
func completeUpload(c *gin.Context) {
	var body completeUploadRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	email := ""
	if emailVal, exists := c.Get("userEmail"); exists {
		if emailStr, ok := emailVal.(string); ok {
			email = emailStr
		}
	}

	var coursePhaseID *uuid.UUID
	if body.CoursePhaseID != "" {
		phaseID, err := uuid.Parse(body.CoursePhaseID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course phase ID"})
			return
		}
		coursePhaseID = &phaseID

		if !ensureCoursePhaseAccess(c, phaseID, permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor, permissionValidation.CourseStudent) {
			return
		}
	} else {
		if !hasRole(c, permissionValidation.PromptAdmin) {
			c.JSON(http.StatusForbidden, gin.H{"error": "course phase ID required"})
			return
		}
	}

	tags := parseTags(body.Tags)
	req := CreateFileFromStorageKeyRequest{
		StorageKey:       body.StorageKey,
		OriginalFilename: body.OriginalFilename,
		ContentType:      body.ContentType,
		CoursePhaseID:    coursePhaseID,
		Description:      body.Description,
		Tags:             tags,
	}

	fileResponse, err := StorageServiceSingleton.CreateFileFromStorageKey(c.Request.Context(), req, userID, email)
	if err != nil {
		log.WithError(err).Error("Failed to complete upload")
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, fileResponse)
}

// getFile godoc
// @Summary Get file metadata
// @Description Get metadata for a specific file
// @Tags storage
// @Produce json
// @Param fileId path string true "File ID"
// @Success 200 {object} FileResponse
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /storage/files/{fileId} [get]
func getFile(c *gin.Context) {
	fileID, err := uuid.Parse(c.Param("fileId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file ID"})
		return
	}

	fileResponse, err := StorageServiceSingleton.GetFileByID(c.Request.Context(), fileID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
		return
	}

	if !authorizeFileAccess(c, fileResponse) {
		return
	}

	c.JSON(http.StatusOK, fileResponse)
}

// deleteFile godoc
// @Summary Delete a file
// @Description Delete a file from storage and database
// @Tags storage
// @Produce json
// @Param fileId path string true "File ID"
// @Param hard query boolean false "Hard delete (remove from storage)"
// @Success 204
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /storage/files/{fileId} [delete]
func deleteFile(c *gin.Context) {
	fileID, err := uuid.Parse(c.Param("fileId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file ID"})
		return
	}

	hardDelete := c.Query("hard") == "true"

	fileResponse, err := StorageServiceSingleton.GetFileByID(c.Request.Context(), fileID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
		return
	}

	if fileResponse.CoursePhaseID != nil {
		if !ensureCoursePhaseAccess(c, *fileResponse.CoursePhaseID, permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor) {
			return
		}
	} else if !hasRole(c, permissionValidation.PromptAdmin) {
		c.JSON(http.StatusForbidden, gin.H{"error": "no permission to delete file"})
		return
	}

	if err := StorageServiceSingleton.DeleteFile(c.Request.Context(), fileID, hardDelete); err != nil {
		log.WithError(err).Error("Failed to delete file")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete file"})
		return
	}

	c.Status(http.StatusNoContent)
}

// getFilesByCoursePhase godoc
// @Summary Get files by course phase
// @Description Get all files associated with a course phase
// @Tags storage
// @Produce json
// @Param coursePhaseId path string true "Course Phase ID"
// @Success 200 {array} FileResponse
// @Failure 400 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /storage/course-phases/{coursePhaseId}/files [get]
func getFilesByCoursePhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course phase ID"})
		return
	}

	if !ensureCoursePhaseAccess(c, coursePhaseID, permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor) {
		return
	}

	files, err := StorageServiceSingleton.GetFilesByCoursePhaseID(c.Request.Context(), coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to get files by course phase")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve files"})
		return
	}

	c.JSON(http.StatusOK, files)
}

func getUserID(c *gin.Context) (string, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		return "", false
	}
	userIDStr, ok := userID.(string)
	return userIDStr, ok
}

func parseTags(tags string) []string {
	if tags == "" {
		return nil
	}
	parts := strings.Split(tags, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}
	return result
}

func hasRole(c *gin.Context, role string) bool {
	rolesVal, exists := c.Get("userRoles")
	if !exists {
		return false
	}
	userRoles, ok := rolesVal.(map[string]bool)
	if !ok {
		return false
	}
	return userRoles[role]
}

func ensureCoursePhaseAccess(c *gin.Context, coursePhaseID uuid.UUID, allowedRoles ...string) bool {
	hasAccess, err := permissionValidation.CheckCoursePhasePermission(c, coursePhaseID, allowedRoles...)
	if err != nil {
		log.WithError(err).Error("Failed to check course phase permissions")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check permissions"})
		return false
	}
	if !hasAccess {
		return false
	}
	return true
}

func authorizeFileAccess(c *gin.Context, file *FileResponse) bool {
	userID, ok := getUserID(c)
	if ok && file.UploadedByUserID == userID {
		return true
	}

	if file.CoursePhaseID == nil && hasRole(c, permissionValidation.PromptAdmin) {
		return true
	}

	if file.CoursePhaseID != nil {
		if ensureCoursePhaseAccess(c, *file.CoursePhaseID, permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor) {
			return true
		}
	}

	c.JSON(http.StatusForbidden, gin.H{"error": "no permission to access file"})
	return false
}
