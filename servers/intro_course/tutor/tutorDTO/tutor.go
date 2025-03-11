package tutorDTO

import (
	"github.com/google/uuid"
)

type Tutor struct {
	ID                  uuid.UUID `json:"id"`
	FirstName           string    `json:"firstName"`
	LastName            string    `json:"lastName"`
	Email               string    `json:"email"`
	MatriculationNumber string    `json:"matriculationNumber"`
	UniversityLogin     string    `json:"universityLogin"`
}
