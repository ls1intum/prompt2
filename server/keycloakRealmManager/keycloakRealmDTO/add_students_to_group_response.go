package keycloakRealmDTO

import "github.com/google/uuid"

type AddStudentsToGroupResponse struct {
	FailedToAddStudentIDs    []uuid.UUID `json:"failedToAddStudentIDs"`
	SucceededToAddStudentIDs []uuid.UUID `json:"succeededToAddStudentIDs"`
}
