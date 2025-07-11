package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ls1intum/prompt-sdk/keycloakTokenVerifier"
	"github.com/minio/minio-go/v7"
	db "github.com/prompt/certificate-service/db/sqlc"
)

type StudentResponse struct {
	ID                 string     `json:"id"`
	Name               string     `json:"name"`
	Team               string     `json:"team"`
	CertificateGenerated bool       `json:"certificateGenerated"`
	LastDownload       *time.Time `json:"lastDownload"`
}

// GetCertificateStatus handles the certificate status endpoint for students
func (s *Server) GetCertificateStatus(c *gin.Context) {
	user, exists := keycloakTokenVerifier.GetTokenUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	studentID, err := uuid.Parse(user.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	courseIDStr := c.Query("courseId")
	if courseIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Course ID is required"})
		return
	}

	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	metadata, err := s.queries.GetCertificateMetadata(context.Background(), db.GetCertificateMetadataParams{
		StudentID: studentID,
		CourseID:  courseID,
	})
	
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"available":    false,
			"lastDownload": nil,
		})
		return
	}

	var lastDownload *time.Time
	if metadata.LastDownload.Valid {
		t := metadata.LastDownload.Time
		lastDownload = &t
	}

	c.JSON(http.StatusOK, gin.H{
		"available":    true,
		"lastDownload": lastDownload,
	})
}

// DownloadCertificate handles certificate downloads for both students and instructors
func (s *Server) DownloadCertificate(c *gin.Context) {
	user, exists := keycloakTokenVerifier.GetTokenUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	studentIDStr := c.Query("studentId")
	if studentIDStr == "" {
		studentIDStr = user.ID
	}

	// Check if requesting user is authorized
	if studentIDStr != user.ID && !user.IsLecturer {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}

	studentID, err := uuid.Parse(studentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	// For now, we'll get the first certificate for this student
	// In a real implementation, you'd want to get the course ID from the request
	metadata, err := s.queries.GetCertificateMetadataByStudentID(context.Background(), studentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Certificate not found"})
		return
	}

	// Get object from MinIO
	obj, err := s.minioClient.GetObject(context.Background(), os.Getenv("MINIO_BUCKET_NAME"), metadata.CertificateUrl, minio.GetObjectOptions{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve certificate"})
		return
	}

	// Update metadata
	now := pgtype.Timestamptz{Time: time.Now(), Valid: true}
	_, err = s.queries.UpdateDownloadInfo(context.Background(), db.UpdateDownloadInfoParams{
		StudentID:    studentID,
		CourseID:     metadata.CourseID,
		LastDownload: now,
	})
	if err != nil {
		// Log error but don't fail the download
		fmt.Printf("Failed to update download metadata: %v\n", err)
	}

	// Set response headers
	filename := fmt.Sprintf("certificate_%s.pdf", studentIDStr)
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "application/pdf")

	// Stream the file to response
	c.DataFromReader(http.StatusOK, -1, "application/pdf", obj, nil)
}

// ListStudents returns a list of students who have certificates for the course
func (s *Server) ListStudents(c *gin.Context) {
	courseIDStr := c.Query("courseId")
	if courseIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Course ID is required"})
		return
	}

	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	// Get all certificate metadata for the course
	certificates, err := s.queries.ListCertificateMetadataByCourse(context.Background(), courseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch student certificates"})
		return
	}

	var students []StudentResponse
	for _, cert := range certificates {
		var lastDownload *time.Time
		if cert.LastDownload.Valid {
			t := cert.LastDownload.Time
			lastDownload = &t
		}

		students = append(students, StudentResponse{
			ID:                   cert.StudentID.String(),
			Name:                 "Student " + cert.StudentID.String()[:8], // Placeholder name since we don't have student data
			Team:                 "Unknown", // Placeholder team since we don't have team data
			CertificateGenerated: cert.GeneratedAt.Valid,
			LastDownload:         lastDownload,
		})
	}

	c.JSON(http.StatusOK, students)
}

// UploadTemplate handles template file uploads
func (s *Server) UploadTemplate(c *gin.Context) {
	courseID := c.Query("courseId")
	file, err := c.FormFile("template")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No template file provided"})
		return
	}

	if filepath.Ext(file.Filename) != ".typ" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only .typ files are allowed"})
		return
	}

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read template file"})
		return
	}
	defer src.Close()

	// Upload to MinIO
	objectName := fmt.Sprintf("templates/%s/template.typ", courseID)
	_, err = s.minioClient.PutObject(context.Background(),
		os.Getenv("MINIO_TEMPLATE_BUCKET_NAME"),
		objectName,
		src,
		file.Size,
		minio.PutObjectOptions{ContentType: "text/plain"},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store template"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Template uploaded successfully"})
}

// GetTemplate retrieves the current template file
func (s *Server) GetTemplate(c *gin.Context) {
	courseID := c.Query("courseId")
	objectName := fmt.Sprintf("templates/%s/template.typ", courseID)

	// Get object from MinIO
	obj, err := s.minioClient.GetObject(context.Background(),
		os.Getenv("MINIO_TEMPLATE_BUCKET_NAME"),
		objectName,
		minio.GetObjectOptions{},
	)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=template.typ")
	c.Header("Content-Type", "text/plain")
	c.DataFromReader(http.StatusOK, -1, "text/plain", obj, nil)
}

// GenerateCertificates generates certificates for all students in a course
func (s *Server) GenerateCertificates(c *gin.Context) {
	courseID := c.Query("courseId")

	// Start certificate generation in a goroutine
	go s.generateCertificatesAsync(courseID)

	c.JSON(http.StatusAccepted, gin.H{
		"message": "Certificate generation started",
	})
}
