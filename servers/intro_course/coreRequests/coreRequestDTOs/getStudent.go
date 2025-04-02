package coreRequestDTOs

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type GetStudent struct {
	ID                   uuid.UUID   `json:"id"`
	FirstName            string      `json:"firstName"`
	LastName             string      `json:"lastName"`
	Email                string      `json:"email"`
	MatriculationNumber  string      `json:"matriculationNumber"`
	UniversityLogin      string      `json:"universityLogin"`
	HasUniversityAccount bool        `json:"hasUniversityAccount"`
	Gender               string      `json:"gender"`
	Nationality          string      `json:"nationality"`
	StudyDegree          string      `json:"studyDegree"`
	StudyProgram         string      `json:"studyProgram"`
	CurrentSemester      pgtype.Int4 `json:"currentSemester"`
}
