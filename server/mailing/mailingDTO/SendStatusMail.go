package mailingDTO

import db "github.com/niclasheun/prompt2.0/db/sqlc"

type SendStatusMail struct {
	StatusMailToBeSend db.PassStatus `json:"status_mail_to_be_send"`
}
