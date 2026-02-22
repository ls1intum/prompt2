package generator

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/certificate/config"
	db "github.com/ls1intum/prompt2/servers/certificate/db/sqlc"
	"github.com/ls1intum/prompt2/servers/certificate/participants"
	log "github.com/sirupsen/logrus"
)

type GeneratorService struct {
	queries db.Queries
}

var GeneratorServiceSingleton *GeneratorService

func NewGeneratorService(queries db.Queries) *GeneratorService {
	return &GeneratorService{
		queries: queries,
	}
}

type CertificateData struct {
	StudentName string `json:"studentName"`
	CourseName  string `json:"courseName"`
	TeamName    string `json:"teamName"`
	Date        string `json:"date"`
}

func GenerateCertificate(ctx context.Context, authHeader string, coursePhaseID, studentID uuid.UUID) ([]byte, error) {
	// Get template content
	templateContent, err := config.GetTemplateContent(ctx, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to get template content")
		return nil, fmt.Errorf("no template configured: %w", err)
	}

	// Get student info
	student, err := participants.GetStudentInfo(ctx, authHeader, coursePhaseID, studentID)
	if err != nil {
		log.WithError(err).Error("Failed to get student info")
		return nil, fmt.Errorf("failed to get student info: %w", err)
	}

	// Get course info
	coursePhase, err := participants.GetCoursePhaseWithCourse(ctx, authHeader, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to get course info")
		return nil, fmt.Errorf("failed to get course info: %w", err)
	}

	// Resolve team name (best-effort, non-fatal if not available)
	teamName, err := participants.GetStudentTeamName(ctx, authHeader, coursePhaseID, studentID)
	if err != nil {
		log.WithError(err).Warn("Could not resolve team name, continuing without it")
	}

	// Create temp directory for processing
	tempDir, err := os.MkdirTemp("", "certificate-*")
	if err != nil {
		log.WithError(err).Error("Failed to create temp directory")
		return nil, fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Write template to temp file
	templatePath := filepath.Join(tempDir, "template.typ")
	if err := os.WriteFile(templatePath, []byte(templateContent), 0644); err != nil {
		log.WithError(err).Error("Failed to write template file")
		return nil, fmt.Errorf("failed to write template file: %w", err)
	}

	// Create certificate data
	certData := CertificateData{
		StudentName: fmt.Sprintf("%s %s", student.FirstName, student.LastName),
		CourseName:  coursePhase.Course.Name,
		TeamName:    teamName,
		Date:        time.Now().Format("January 2, 2006"),
	}

	// Write data JSON file
	dataPath := filepath.Join(tempDir, "data.json")
	dataJSON, err := json.Marshal(certData)
	if err != nil {
		log.WithError(err).Error("Failed to marshal certificate data")
		return nil, fmt.Errorf("failed to marshal certificate data: %w", err)
	}
	if err := os.WriteFile(dataPath, dataJSON, 0644); err != nil {
		log.WithError(err).Error("Failed to write data file")
		return nil, fmt.Errorf("failed to write data file: %w", err)
	}

	// Generate PDF using typst
	outputPath := filepath.Join(tempDir, "certificate.pdf")
	cmd := exec.CommandContext(ctx, "typst", "compile", "--input", fmt.Sprintf("data=%s", dataPath), templatePath, outputPath)
	cmd.Dir = tempDir

	if out, err := cmd.CombinedOutput(); err != nil {
		log.WithFields(log.Fields{
			"error":  err,
			"output": string(out),
		}).Error("Typst compilation failed")
		return nil, fmt.Errorf("typst compilation failed: %w, output: %s", err, out)
	}

	// Read generated PDF
	pdfData, err := os.ReadFile(outputPath)
	if err != nil {
		log.WithError(err).Error("Failed to read generated PDF")
		return nil, fmt.Errorf("failed to read generated PDF: %w", err)
	}

	// Record the download
	_, err = GeneratorServiceSingleton.queries.RecordCertificateDownload(ctx, db.RecordCertificateDownloadParams{
		StudentID:     studentID,
		CoursePhaseID: coursePhaseID,
	})
	if err != nil {
		log.WithError(err).Warn("Failed to record certificate download")
		// Don't fail the generation, just log the error
	}

	return pdfData, nil
}
