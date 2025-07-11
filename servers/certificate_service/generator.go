package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/minio/minio-go/v7"
	db "github.com/prompt/certificate-service/db/sqlc"
)

type CertificateData struct {
	StudentID    string `json:"studentId"`
	StudentName  string `json:"studentName"`
	TeamName     string `json:"teamName"`
	CourseName   string `json:"courseName"`
}

func (s *Server) generateCertificatesAsync(courseID string) {
	ctx := context.Background()
	
	// Get template from MinIO
	templateObj, err := s.minioClient.GetObject(ctx,
		os.Getenv("MINIO_TEMPLATE_BUCKET_NAME"),
		fmt.Sprintf("templates/%s/template.typ", courseID),
		minio.GetObjectOptions{},
	)
	if err != nil {
		fmt.Printf("Failed to get template: %v\n", err)
		return
	}

	// Create temp directory for processing
	tempDir, err := os.MkdirTemp("", "certificate-*")
	if err != nil {
		fmt.Printf("Failed to create temp dir: %v\n", err)
		return
	}
	defer os.RemoveAll(tempDir)

	// Save template to temp file
	templatePath := filepath.Join(tempDir, "template.typ")
	templateFile, err := os.Create(templatePath)
	if err != nil {
		fmt.Printf("Failed to create template file: %v\n", err)
		return
	}

	if _, err := io.Copy(templateFile, templateObj); err != nil {
		fmt.Printf("Failed to save template: %v\n", err)
		return
	}
	templateFile.Close()

	// For demo purposes, we'll use mock data
	// In a real implementation, you would get this data from the core service API
	students := []CertificateData{
		{
			StudentID:   "550e8400-e29b-41d4-a716-446655440001",
			StudentName: "John Doe",
			TeamName:    "Team Alpha",
			CourseName:  "Software Engineering",
		},
		{
			StudentID:   "550e8400-e29b-41d4-a716-446655440002",
			StudentName: "Jane Smith",
			TeamName:    "Team Beta",
			CourseName:  "Software Engineering",
		},
	}

	// Generate certificates for each student
	for _, student := range students {
		if err := s.generateStudentCertificate(ctx, tempDir, templatePath, courseID, student); err != nil {
			fmt.Printf("Failed to generate certificate for %s: %v\n", student.StudentID, err)
		}
	}
}

func (s *Server) generateStudentCertificate(ctx context.Context, tempDir, templatePath, courseID string, student CertificateData) error {
	// Create variables file for typst
	varsPath := filepath.Join(tempDir, fmt.Sprintf("vars_%s.json", student.StudentID))
	varsContent := map[string]interface{}{
		"courseName":  student.CourseName,
		"studentName": student.StudentName,
		"teamName":    student.TeamName,
		"date":        time.Now().Format("January 2, 2006"),
	}

	varsJSON, err := json.Marshal(varsContent)
	if err != nil {
		return fmt.Errorf("failed to marshal vars: %w", err)
	}

	if err := os.WriteFile(varsPath, varsJSON, 0644); err != nil {
		return fmt.Errorf("failed to write vars file: %w", err)
	}

	// Generate PDF using typst
	outputPath := filepath.Join(tempDir, fmt.Sprintf("%s.pdf", student.StudentID))
	cmd := exec.Command("typst", "compile", "--input", fmt.Sprintf("vars=%s", varsPath), templatePath, outputPath)
	
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("typst compilation failed: %w, output: %s", err, out)
	}

	// Upload PDF to MinIO
	pdfFile, err := os.Open(outputPath)
	if err != nil {
		return fmt.Errorf("failed to open generated PDF: %w", err)
	}
	defer pdfFile.Close()

	objectName := fmt.Sprintf("%s/%s.pdf", courseID, student.StudentID)
	_, err = s.minioClient.PutObject(ctx,
		os.Getenv("MINIO_BUCKET_NAME"),
		objectName,
		pdfFile,
		-1, // Let MinIO determine size
		minio.PutObjectOptions{ContentType: "application/pdf"},
	)
	if err != nil {
		return fmt.Errorf("failed to upload PDF to MinIO: %w", err)
	}

	// Parse student ID as UUID
	studentUUID, err := uuid.Parse(student.StudentID)
	if err != nil {
		return fmt.Errorf("invalid student ID format: %w", err)
	}

	courseUUID, err := uuid.Parse(courseID)
	if err != nil {
		return fmt.Errorf("invalid course ID format: %w", err)
	}

	// Upsert certificate metadata using sqlc
	now := pgtype.Timestamptz{Time: time.Now(), Valid: true}
	_, err = s.queries.UpsertCertificateMetadata(ctx, db.UpsertCertificateMetadataParams{
		StudentID:      studentUUID,
		CourseID:       courseUUID,
		GeneratedAt:    now,
		CertificateUrl: objectName,
	})

	if err != nil {
		return fmt.Errorf("failed to update certificate metadata: %w", err)
	}

	fmt.Printf("Successfully generated certificate for student %s\n", student.StudentID)
	return nil
}
