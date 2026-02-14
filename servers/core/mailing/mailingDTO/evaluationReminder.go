package mailingDTO

import "time"

type EvaluationType string

const (
	EvaluationTypeSelf  EvaluationType = "self"
	EvaluationTypePeer  EvaluationType = "peer"
	EvaluationTypeTutor EvaluationType = "tutor"
)

type SendEvaluationReminderRequest struct {
	EvaluationType EvaluationType `json:"evaluationType"`
}

type EvaluationReminderReport struct {
	SuccessfulEmails    []string       `json:"successfulEmails"`
	FailedEmails        []string       `json:"failedEmails"`
	RequestedRecipients int            `json:"requestedRecipients"`
	EvaluationType      EvaluationType `json:"evaluationType"`
	Deadline            *time.Time     `json:"deadline"`
	DeadlinePassed      bool           `json:"deadlinePassed"`
	SentAt              time.Time      `json:"sentAt"`
	PreviousSentAt      *time.Time     `json:"previousSentAt"`
}

func (e EvaluationType) IsValid() bool {
	return e == EvaluationTypeSelf || e == EvaluationTypePeer || e == EvaluationTypeTutor
}
