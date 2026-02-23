package participants

import (
	"time"

	"github.com/google/uuid"
)

type Student struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
	MatrNr    *string   `json:"matrNr,omitempty"`
}

type CoursePhaseParticipation struct {
	ID                    uuid.UUID `json:"id"`
	CourseParticipationID uuid.UUID `json:"courseParticipationId"`
	Student               Student   `json:"student"`
}

type CoursePhaseParticipationsResponse struct {
	CoursePhaseParticipations []CoursePhaseParticipation `json:"participations"`
}

type ParticipantWithDownloadStatus struct {
	ID            uuid.UUID  `json:"id"`
	FirstName     string     `json:"firstName"`
	LastName      string     `json:"lastName"`
	Email         string     `json:"email"`
	HasDownloaded bool       `json:"hasDownloaded"`
	FirstDownload *time.Time `json:"firstDownload,omitempty"`
	LastDownload  *time.Time `json:"lastDownload,omitempty"`
	DownloadCount int32      `json:"downloadCount"`
}

type Course struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type CoursePhaseWithCourse struct {
	ID       uuid.UUID `json:"id"`
	CourseID uuid.UUID `json:"courseId"`
	Course   Course    `json:"course"`
}

// CoursePhaseParticipationSelf is the response from core's /participations/self endpoint
type CoursePhaseParticipationSelf struct {
	CoursePhaseID         uuid.UUID `json:"coursePhaseID"`
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
	Student               Student   `json:"student"`
}
