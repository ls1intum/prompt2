package mailing

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/core/coursePhase/resolution"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/mailing/mailingDTO"
)

type assessmentReminderRecipientsResponse struct {
	EvaluationType                         string      `json:"evaluationType"`
	EvaluationEnabled                      bool        `json:"evaluationEnabled"`
	Deadline                               *time.Time  `json:"deadline"`
	DeadlinePassed                         bool        `json:"deadlinePassed"`
	IncompleteAuthorCourseParticipationIDs []uuid.UUID `json:"incompleteAuthorCourseParticipationIDs"`
	TotalAuthors                           int         `json:"totalAuthors"`
	CompletedAuthors                       int         `json:"completedAuthors"`
}

type coursePhaseRestrictedData struct {
	MailingSettings struct {
		AssessmentReminder struct {
			Subject          string            `json:"subject"`
			Content          string            `json:"content"`
			LastSentAtByType map[string]string `json:"lastSentAtByType"`
		} `json:"assessmentReminder"`
	} `json:"mailingSettings"`
}

func SendEvaluationReminderManualTrigger(
	ctx context.Context,
	coursePhaseID uuid.UUID,
	evaluationType mailingDTO.EvaluationType,
	authHeader string,
) (mailingDTO.EvaluationReminderReport, error) {
	report := mailingDTO.EvaluationReminderReport{
		SuccessfulEmails:    make([]string, 0),
		FailedEmails:        make([]string, 0),
		RequestedRecipients: 0,
		EvaluationType:      evaluationType,
	}

	phase, err := MailingServiceSingleton.queries.GetCoursePhase(ctx, coursePhaseID)
	if err != nil {
		return report, fmt.Errorf("failed to get course phase %s: %w", coursePhaseID, err)
	}
	phaseType, err := MailingServiceSingleton.queries.GetCoursePhaseTypeByID(ctx, phase.CoursePhaseTypeID)
	if err != nil {
		return report, fmt.Errorf("failed to get course phase type for phase %s: %w", coursePhaseID, err)
	}

	restrictedData, err := parseCoursePhaseRestrictedData(phase.RestrictedData)
	if err != nil {
		return report, err
	}

	assessmentReminderConfig := restrictedData.MailingSettings.AssessmentReminder
	if assessmentReminderConfig.Subject == "" || assessmentReminderConfig.Content == "" {
		return report, fmt.Errorf("assessment reminder template incomplete: subject or content is empty")
	}
	report.PreviousSentAt = getPreviousSentAt(assessmentReminderConfig.LastSentAtByType, evaluationType)

	recipientResponse, err := fetchIncompleteReminderRecipients(
		ctx,
		coursePhaseID,
		phaseType.BaseUrl,
		evaluationType,
		authHeader,
	)
	if err != nil {
		return report, err
	}

	report.Deadline = recipientResponse.Deadline
	report.DeadlinePassed = recipientResponse.DeadlinePassed

	if !recipientResponse.EvaluationEnabled {
		return report, fmt.Errorf("evaluation type %s is disabled for this phase", evaluationType)
	}
	if !recipientResponse.DeadlinePassed {
		if recipientResponse.Deadline != nil {
			return report, fmt.Errorf(
				"evaluation deadline has not passed yet (deadline: %s)",
				recipientResponse.Deadline.Format(time.RFC3339),
			)
		}
		return report, fmt.Errorf("evaluation deadline has not passed yet")
	}

	recipientIDs := deduplicateUUIDList(recipientResponse.IncompleteAuthorCourseParticipationIDs)
	participants, err := MailingServiceSingleton.queries.GetParticipantMailingInformationByIDs(
		ctx,
		db.GetParticipantMailingInformationByIDsParams{
			ID:      coursePhaseID,
			Column2: recipientIDs,
		},
	)
	if err != nil {
		return report, fmt.Errorf("failed to load reminder recipients: %w", err)
	}
	report.RequestedRecipients = len(participants)

	courseMailingSettings, err := getSenderInformation(ctx, coursePhaseID)
	if err != nil {
		return report, fmt.Errorf("failed to get sender information: %w", err)
	}

	passedMailingInfo, err := MailingServiceSingleton.queries.GetPassedMailingInformation(ctx, coursePhaseID)
	if err != nil {
		return report, fmt.Errorf("failed to load course mailing context for reminders: %w", err)
	}

	coursePhaseName := ""
	if phase.Name.Valid {
		coursePhaseName = phase.Name.String
	}
	evaluationTypeLabel := getEvaluationTypeLabel(evaluationType)
	evaluationDeadlinePlaceholder := getEvaluationDeadlinePlaceholder(recipientResponse.Deadline)

	for _, participant := range participants {
		basePlaceholderMap := getStatusEmailPlaceholderValues(
			passedMailingInfo.CourseName,
			passedMailingInfo.CourseStartDate,
			passedMailingInfo.CourseEndDate,
			db.GetParticipantMailingInformationRow{
				FirstName:           participant.FirstName,
				LastName:            participant.LastName,
				Email:               participant.Email,
				MatriculationNumber: participant.MatriculationNumber,
				UniversityLogin:     participant.UniversityLogin,
				StudyDegree:         participant.StudyDegree,
				CurrentSemester:     participant.CurrentSemester,
				StudyProgram:        participant.StudyProgram,
			},
		)
		basePlaceholderMap["evaluationType"] = evaluationTypeLabel
		basePlaceholderMap["evaluationDeadline"] = evaluationDeadlinePlaceholder
		basePlaceholderMap["coursePhaseName"] = coursePhaseName

		finalSubject := replacePlaceholders(assessmentReminderConfig.Subject, basePlaceholderMap)
		finalContent := replacePlaceholders(assessmentReminderConfig.Content, basePlaceholderMap)

		if err := SendMail(courseMailingSettings, participant.Email.String, finalSubject, finalContent); err != nil {
			report.FailedEmails = append(report.FailedEmails, participant.Email.String)
			continue
		}
		report.SuccessfulEmails = append(report.SuccessfulEmails, participant.Email.String)
	}

	report.SentAt = time.Now().UTC()
	if err := MailingServiceSingleton.queries.UpdateAssessmentReminderLastSentAt(
		ctx,
		db.UpdateAssessmentReminderLastSentAtParams{
			ID:      coursePhaseID,
			Column2: string(evaluationType),
			Column3: report.SentAt.Format(time.RFC3339),
		},
	); err != nil {
		return report, fmt.Errorf("failed to persist reminder send timestamp: %w", err)
	}

	return report, nil
}

func parseCoursePhaseRestrictedData(raw []byte) (coursePhaseRestrictedData, error) {
	if len(raw) == 0 {
		return coursePhaseRestrictedData{}, nil
	}
	var restrictedData coursePhaseRestrictedData
	if err := json.Unmarshal(raw, &restrictedData); err != nil {
		return coursePhaseRestrictedData{}, fmt.Errorf("failed to parse course phase restricted data: %w", err)
	}
	return restrictedData, nil
}

func getPreviousSentAt(
	lastSentAtByType map[string]string,
	evaluationType mailingDTO.EvaluationType,
) *time.Time {
	if len(lastSentAtByType) == 0 {
		return nil
	}
	rawValue, ok := lastSentAtByType[string(evaluationType)]
	if !ok || rawValue == "" {
		return nil
	}
	parsed, err := time.Parse(time.RFC3339, rawValue)
	if err != nil {
		return nil
	}
	return &parsed
}

func fetchIncompleteReminderRecipients(
	ctx context.Context,
	coursePhaseID uuid.UUID,
	baseURL string,
	evaluationType mailingDTO.EvaluationType,
	authHeader string,
) (assessmentReminderRecipientsResponse, error) {
	normalizedCoreHost := resolution.NormaliseHost(promptSDK.GetEnv("CORE_HOST", "http://localhost:8080"))
	resolvedBaseURL := strings.ReplaceAll(baseURL, "{CORE_HOST}", normalizedCoreHost)

	endpoint, err := url.JoinPath(resolvedBaseURL, "course_phase", coursePhaseID.String(), "config", "reminders", "incomplete")
	if err != nil {
		return assessmentReminderRecipientsResponse{}, fmt.Errorf("failed to build reminder recipient endpoint: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return assessmentReminderRecipientsResponse{}, fmt.Errorf("failed to create reminder recipient request: %w", err)
	}

	query := req.URL.Query()
	query.Set("type", string(evaluationType))
	req.URL.RawQuery = query.Encode()

	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return assessmentReminderRecipientsResponse{}, fmt.Errorf("failed to fetch reminder recipients from assessment service: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return assessmentReminderRecipientsResponse{}, fmt.Errorf("failed to read assessment reminder response: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return assessmentReminderRecipientsResponse{}, fmt.Errorf(
			"assessment reminder recipient request failed with status %d: %s",
			resp.StatusCode,
			strings.TrimSpace(string(body)),
		)
	}

	var parsed assessmentReminderRecipientsResponse
	if err := json.Unmarshal(body, &parsed); err != nil {
		return assessmentReminderRecipientsResponse{}, fmt.Errorf("failed to parse assessment reminder response: %w", err)
	}

	return parsed, nil
}

func deduplicateUUIDList(values []uuid.UUID) []uuid.UUID {
	seen := make(map[uuid.UUID]struct{}, len(values))
	result := make([]uuid.UUID, 0, len(values))
	for _, value := range values {
		if _, exists := seen[value]; exists {
			continue
		}
		seen[value] = struct{}{}
		result = append(result, value)
	}
	return result
}

func getEvaluationTypeLabel(evaluationType mailingDTO.EvaluationType) string {
	switch evaluationType {
	case mailingDTO.EvaluationTypeSelf:
		return "Self Evaluation"
	case mailingDTO.EvaluationTypePeer:
		return "Peer Evaluation"
	case mailingDTO.EvaluationTypeTutor:
		return "Tutor Evaluation"
	default:
		return string(evaluationType)
	}
}

func getEvaluationDeadlinePlaceholder(deadline *time.Time) string {
	if deadline == nil {
		return ""
	}
	return deadline.Format("02.01.2006 15:04")
}
