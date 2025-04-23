package coreRequestDTO

import (
	"github.com/google/uuid"
)

// reduced course to the data needed
type Course struct {
	ID           uuid.UUID     `json:"id"`
	Name         string        `json:"name"`
	SemesterTag  string        `json:"semesterTag"`
	CoursePhases []CoursePhase `json:"coursePhases"`
}

// reduced course phase
type CoursePhase struct {
	ID              uuid.UUID `json:"id"`
	CourseID        uuid.UUID `json:"courseID"`
	Name            string    `json:"name"`
	CoursePhaseType string    `json:"coursePhaseType"`
}
