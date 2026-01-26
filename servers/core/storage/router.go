package storage

import (
	"net/http"

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

	// File operations
	storage.POST("/upload", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor, permissionValidation.CourseStudent), uploadFile)
	storage.GET("/files/:fileId", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor, permissionValidation.CourseStudent), getFile)
	storage.GET("/files/:fileId/download", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor, permissionValidation.CourseStudent), downloadFile)
	storage.DELETE("/files/:fileId", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), deleteFile)

	// List files by association
	storage.GET("/course-phases/:coursePhaseId/files", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getFilesByCoursePhase)
}

// uploadFile godoc
// @Summary Upload a file
// @Description Upload a file to the storage backend
// @Tags storage
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to upload"
// @Param coursePhaseId formData string false "Course Phase ID to associate with the file"
// @Param description formData string false "File description"
// @Param tags formData string false "Comma-separated tags"
// @Success 201 {object} FileResponse
// @Failure 400 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /storage/upload [post]
func uploadFile(c *gin.Context) {
	// Get the uploaded file
	fileHeader, err := c.FormFile("file")
	if err != nil {
		log.WithFields(log.Fields{
			"path":      c.Request.URL.Path,
			"method":    c.Request.Method,
			"clientIP":  c.ClientIP(),
			"userAgent": c.Request.UserAgent(),
		}).WithError(err).Warn("Upload failed: file is required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	// Get user information from context
	userID, exists := c.Get("userID")
	if !exists {
		log.WithFields(log.Fields{
			"path":                  c.Request.URL.Path,
			"method":                c.Request.Method,
			"clientIP":              c.ClientIP(),
			"userAgent":             c.Request.UserAgent(),
			"hasAuthorizationHeader": c.GetHeader("Authorization") != "",
			"hasUserID":             exists,
		}).Warn("Upload unauthorized: user id missing in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	email, _ := c.Get("userEmail")

	// Parse optional parameters
	var coursePhaseID *uuid.UUID
	if phaseIDStr := c.PostForm("coursePhaseId"); phaseIDStr != "" {
		phaseID, err := uuid.Parse(phaseIDStr)
		if err != nil {
			log.WithFields(log.Fields{
				"path":         c.Request.URL.Path,
				"method":       c.Request.Method,
				"clientIP":     c.ClientIP(),
				"userAgent":    c.Request.UserAgent(),
				"coursePhaseId": phaseIDStr,
			}).WithError(err).Warn("Upload failed: invalid course phase ID")
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course phase ID"})
			return
		}
		coursePhaseID = &phaseID
	}

	description := c.PostForm("description")
	
	// Parse tags (comma-separated)
	var tags []string
	if tagsStr := c.PostForm("tags"); tagsStr != "" {
		// Simple split by comma - could be enhanced with proper CSV parsing
		tags = []string{tagsStr}
	}

	// Create upload request
	req := FileUploadRequest{
		File:           fileHeader,
		UploaderUserID: userID.(string),
		CoursePhaseID:  coursePhaseID,
		Description:    description,
		Tags:           tags,
	}

	if emailStr, ok := email.(string); ok {
		req.UploaderEmail = emailStr
	}

	coursePhaseIDStr := ""
	if coursePhaseID != nil {
		coursePhaseIDStr = coursePhaseID.String()
	}

	// Upload the file
	fileResponse, err := StorageServiceSingleton.UploadFile(c.Request.Context(), req)
	if err != nil {
		log.WithFields(log.Fields{
			"path":          c.Request.URL.Path,
			"method":        c.Request.Method,
			"clientIP":      c.ClientIP(),
			"userAgent":     c.Request.UserAgent(),
			"uploaderUserID": userID.(string),
			"filename":      fileHeader.Filename,
			"sizeBytes":     fileHeader.Size,
			"contentType":   fileHeader.Header.Get("Content-Type"),
			"coursePhaseId": coursePhaseIDStr,
		}).WithError(err).Error("Failed to upload file")
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

	c.JSON(http.StatusOK, fileResponse)
}

// downloadFile godoc
// @Summary Download a file
// @Description Download the actual file content
// @Tags storage
// @Produce application/octet-stream
// @Param fileId path string true "File ID"
// @Success 200 {file} binary
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /storage/files/{fileId}/download [get]
func downloadFile(c *gin.Context) {
	fileID, err := uuid.Parse(c.Param("fileId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file ID"})
		return
	}

	reader, filename, err := StorageServiceSingleton.DownloadFile(c.Request.Context(), fileID)
	if err != nil {
		log.WithError(err).Error("Failed to download file")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to download file"})
		return
	}
	defer reader.Close()

	// Set headers for file download
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "application/octet-stream")

	// Stream the file to the response
	c.DataFromReader(http.StatusOK, -1, "application/octet-stream", reader, nil)
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

	files, err := StorageServiceSingleton.GetFilesByCoursePhaseID(c.Request.Context(), coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to get files by course phase")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve files"})
		return
	}

	c.JSON(http.StatusOK, files)
}
