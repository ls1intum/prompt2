package coreRequestDTOs

import "github.com/google/uuid"

type AddStudentsToGroup struct {
	StudentsToAdd []uuid.UUID `json:"studentsToAdd"`
}
