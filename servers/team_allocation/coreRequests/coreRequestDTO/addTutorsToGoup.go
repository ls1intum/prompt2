package coreRequestDTO

import "github.com/google/uuid"

type AddTutorsToGroup struct {
	Tutors []uuid.UUID `json:"tutors"`
}
