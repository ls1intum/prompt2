package keycloakRealmDTO

type AddStudentsToGroupResponse struct {
	FailedToAddStudentIDs    []string `json:"failedToAddStudentIDs"`
	SucceededToAddStudentIDs []string `json:"succeededToAddStudentIDs"`
}
