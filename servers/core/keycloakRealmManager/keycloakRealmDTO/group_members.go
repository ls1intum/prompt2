package keycloakRealmDTO

import "github.com/niclasheun/prompt2.0/student/studentDTO"

type GroupMembers struct {
	Students    []studentDTO.Student `json:"students"`
	NonStudents []KeycloakUser       `json:"nonStudents"`
}
