package keycloakRealmDTO

import "github.com/ls1intum/prompt2/servers/core/student/studentDTO"

type GroupMembers struct {
	Students    []studentDTO.Student `json:"students"`
	NonStudents []KeycloakUser       `json:"nonStudents"`
}
