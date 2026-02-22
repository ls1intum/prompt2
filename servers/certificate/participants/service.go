package participants

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/certificate/db/sqlc"
	"github.com/ls1intum/prompt2/servers/certificate/utils"
	log "github.com/sirupsen/logrus"
)

type ParticipantsService struct {
	queries    db.Queries
	httpClient *http.Client
	coreURL    string
}

var ParticipantsServiceSingleton *ParticipantsService

func NewParticipantsService(queries db.Queries) *ParticipantsService {
	return &ParticipantsService{
		queries: queries,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		coreURL: utils.GetCoreUrl(),
	}
}

func (s *ParticipantsService) makeAuthenticatedRequest(ctx context.Context, method, url, authHeader string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", authHeader)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}

	return resp, nil
}

func GetParticipationsForCoursePhase(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]ParticipantWithDownloadStatus, error) {
	s := ParticipantsServiceSingleton

	url := fmt.Sprintf("%s/api/course_phases/%s/participations", s.coreURL, coursePhaseID.String())
	log.WithField("url", url).Debug("Fetching participations from core service")

	resp, err := s.makeAuthenticatedRequest(ctx, "GET", url, authHeader)
	if err != nil {
		log.WithError(err).Error("Failed to fetch participations from core service")
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.WithFields(log.Fields{
			"status": resp.Status,
			"body":   string(body),
		}).Error("Failed to fetch participations from core service")
		return nil, fmt.Errorf("failed to fetch participations: %s", resp.Status)
	}

	var participationsResp CoursePhaseParticipationsResponse
	if err := json.NewDecoder(resp.Body).Decode(&participationsResp); err != nil {
		log.WithError(err).Error("Failed to decode participations response")
		return nil, fmt.Errorf("failed to decode participations response: %w", err)
	}

	// Get download records for this course phase
	downloads, err := s.queries.ListCertificateDownloadsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.WithError(err).Warn("Failed to fetch certificate downloads, continuing without download info")
		downloads = []db.CertificateDownload{}
	}

	// Create a map for quick lookup
	downloadMap := make(map[uuid.UUID]db.CertificateDownload)
	for _, d := range downloads {
		downloadMap[d.StudentID] = d
	}

	// Map participations with download status
	result := make([]ParticipantWithDownloadStatus, 0, len(participationsResp.CoursePhaseParticipations))
	for _, p := range participationsResp.CoursePhaseParticipations {
		participant := ParticipantWithDownloadStatus{
			ID:            p.Student.ID,
			FirstName:     p.Student.FirstName,
			LastName:      p.Student.LastName,
			Email:         p.Student.Email,
			HasDownloaded: false,
			DownloadCount: 0,
		}

		if download, found := downloadMap[p.Student.ID]; found {
			participant.HasDownloaded = true
			participant.DownloadCount = download.DownloadCount
			if download.FirstDownload.Valid {
				t := download.FirstDownload.Time
				participant.FirstDownload = &t
			}
			if download.LastDownload.Valid {
				t := download.LastDownload.Time
				participant.LastDownload = &t
			}
		}

		result = append(result, participant)
	}

	return result, nil
}

func GetCoursePhaseWithCourse(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) (*CoursePhaseWithCourse, error) {
	s := ParticipantsServiceSingleton

	url := fmt.Sprintf("%s/api/course_phases/%s", s.coreURL, coursePhaseID.String())
	log.WithField("url", url).Debug("Fetching course phase info from core service")

	resp, err := s.makeAuthenticatedRequest(ctx, "GET", url, authHeader)
	if err != nil {
		log.WithError(err).Error("Failed to fetch course phase info from core service")
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.WithFields(log.Fields{
			"status": resp.Status,
			"body":   string(body),
		}).Error("Failed to fetch course phase info from core service")
		return nil, fmt.Errorf("failed to fetch course phase info: %s", resp.Status)
	}

	var coursePhase CoursePhaseWithCourse
	if err := json.NewDecoder(resp.Body).Decode(&coursePhase); err != nil {
		log.WithError(err).Error("Failed to decode course phase response")
		return nil, fmt.Errorf("failed to decode course phase response: %w", err)
	}

	return &coursePhase, nil
}

func GetStudentInfo(ctx context.Context, authHeader string, coursePhaseID, studentID uuid.UUID) (*Student, error) {
	s := ParticipantsServiceSingleton

	url := fmt.Sprintf("%s/api/course_phases/%s/participations/%s", s.coreURL, coursePhaseID.String(), studentID.String())
	log.WithField("url", url).Debug("Fetching student info from core service")

	resp, err := s.makeAuthenticatedRequest(ctx, "GET", url, authHeader)
	if err != nil {
		log.WithError(err).Error("Failed to fetch student info from core service")
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.WithFields(log.Fields{
			"status": resp.Status,
			"body":   string(body),
		}).Error("Failed to fetch student info from core service")
		return nil, fmt.Errorf("failed to fetch student info: %s", resp.Status)
	}

	var participation CoursePhaseParticipation
	if err := json.NewDecoder(resp.Body).Decode(&participation); err != nil {
		log.WithError(err).Error("Failed to decode student response")
		return nil, fmt.Errorf("failed to decode student response: %w", err)
	}

	return &participation.Student, nil
}
