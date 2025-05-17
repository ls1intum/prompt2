package mailingDTO

import db "github.com/ls1intum/prompt2/servers/core/db/sqlc"

type SendStatusMail struct {
	StatusMailToBeSend db.PassStatus `json:"statusMailToBeSend"`
}
