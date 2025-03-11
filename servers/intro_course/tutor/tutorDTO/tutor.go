package tutorDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

type Tutor struct {
	ID                  uuid.UUID `json:"id"`
	FirstName           string    `json:"firstName"`
	LastName            string    `json:"lastName"`
	Email               string    `json:"email"`
	MatriculationNumber string    `json:"matriculationNumber"`
	UniversityLogin     string    `json:"universityLogin"`
}

func GetTutorDTOFromModel(model db.Tutor) Tutor {
	return Tutor{
		ID:                  model.ID,
		FirstName:           model.FirstName,
		LastName:            model.LastName,
		Email:               model.Email,
		MatriculationNumber: model.MatriculationNumber,
		UniversityLogin:     model.UniversityLogin,
	}
}

func GetTutorDTOsFromModels(models []db.Tutor) []Tutor {
	tutors := make([]Tutor, 0, len(models))
	for _, model := range models {
		tutors = append(tutors, GetTutorDTOFromModel(model))
	}
	return tutors
}
