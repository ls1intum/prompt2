package teamDTO

import "github.com/google/uuid"

type StudentNameUpdateRequest struct {
	CoursePhaseID     uuid.UUID                 `json:"coursePhaseID"`
	StudentNamesPerID map[uuid.UUID]StudentName `json:"studentNamesPerID"`
}

type StudentName struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}
