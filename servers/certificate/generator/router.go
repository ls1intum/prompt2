package generator

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt-sdk/keycloakTokenVerifier"
	db "github.com/ls1intum/prompt2/servers/certificate/db/sqlc"
	"github.com/ls1intum/prompt2/servers/certificate/participants"
	log "github.com/sirupsen/logrus"
)

func setupGeneratorRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	generatorRouter := routerGroup.Group("/certificate")

	// Student can download their own certificate
	generatorRouter.GET("/download", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor, promptSDK.CourseStudent), downloadOwnCertificate)

	// Instructor can download certificate for any student
	generatorRouter.GET("/download/:studentID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), downloadStudentCertificate)

	// Status endpoint for students
	generatorRouter.GET("/status", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor, promptSDK.CourseStudent), getCertificateStatus)

	// Preview endpoint for instructors - generates certificate with mock data
	generatorRouter.GET("/preview", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), previewCertificate)
}

func downloadOwnCertificate(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	// Get user info directly from JWT token (no core API call needed)
	user, exists := keycloakTokenVerifier.GetTokenUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	studentID, err := uuid.Parse(user.ID)
	if err != nil {
		log.WithError(err).Error("Failed to parse user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	student := &participants.Student{
		ID:        studentID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
	}

	authHeader := c.GetHeader("Authorization")
	pdfData, err := GenerateCertificate(c, authHeader, coursePhaseID, student)
	if err != nil {
		log.WithError(err).Error("Failed to generate certificate")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate certificate"})
		return
	}

	filename := fmt.Sprintf("certificate_%s.pdf", user.LastName)
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "application/pdf")
	c.Data(http.StatusOK, "application/pdf", pdfData)
}

func downloadStudentCertificate(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	studentID, err := uuid.Parse(c.Param("studentID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse student ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	authHeader := c.GetHeader("Authorization")

	// Instructor fetching certificate for a specific student — look up student info from core
	student, err := participants.GetStudentInfo(c, authHeader, coursePhaseID, studentID)
	if err != nil {
		log.WithError(err).Error("Failed to get student info")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get student info"})
		return
	}

	pdfData, err := GenerateCertificate(c, authHeader, coursePhaseID, student)
	if err != nil {
		log.WithError(err).Error("Failed to generate certificate")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate certificate"})
		return
	}

	filename := fmt.Sprintf("certificate_%s.pdf", studentID.String())
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "application/pdf")
	c.Data(http.StatusOK, "application/pdf", pdfData)
}

func getCertificateStatus(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	// Get user ID from token
	user, exists := keycloakTokenVerifier.GetTokenUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	studentID, err := uuid.Parse(user.ID)
	if err != nil {
		log.WithError(err).Error("Failed to parse user ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Check if template is configured
	_, err = getTemplateStatus(c, coursePhaseID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"available":     false,
			"hasDownloaded": false,
			"message":       "Certificate template not configured",
		})
		return
	}

	// Check download status
	download, err := GeneratorServiceSingleton.queries.GetCertificateDownload(c, db.GetCertificateDownloadParams{
		StudentID:     studentID,
		CoursePhaseID: coursePhaseID,
	})

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"available":     true,
			"hasDownloaded": false,
		})
		return
	}

	var lastDownload *string
	if download.LastDownload.Valid {
		t := download.LastDownload.Time.Format("2006-01-02T15:04:05Z07:00")
		lastDownload = &t
	}

	c.JSON(http.StatusOK, gin.H{
		"available":     true,
		"hasDownloaded": true,
		"lastDownload":  lastDownload,
		"downloadCount": download.DownloadCount,
	})
}

func previewCertificate(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	pdfData, err := GeneratePreviewCertificate(c, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to generate preview certificate")
		var typstErr *TypstCompilationError
		if errors.As(err, &typstErr) {
			c.JSON(http.StatusUnprocessableEntity, gin.H{
				"error":          "Template compilation failed",
				"compilerOutput": typstErr.Output,
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Disposition", "inline; filename=certificate_preview.pdf")
	c.Header("Content-Type", "application/pdf")
	c.Data(http.StatusOK, "application/pdf", pdfData)
}

func getTemplateStatus(c *gin.Context, coursePhaseID uuid.UUID) (bool, error) {
	config, err := GeneratorServiceSingleton.queries.GetCoursePhaseConfig(c, coursePhaseID)
	if err != nil {
		return false, err
	}
	if !config.TemplateContent.Valid || config.TemplateContent.String == "" {
		return false, fmt.Errorf("no template configured")
	}
	return true, nil
}
