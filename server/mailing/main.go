package mailing

import (
	"net/mail"

	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func InitMailingModule(smtpHost, smtpPort, senderName, senderEmail, clientURL string, queries db.Queries, conn *pgxpool.Pool) {
	MailingServiceSingleton = &MailingService{
		smtpHost:    smtpHost,
		smtpPort:    smtpPort,
		senderEmail: mail.Address{Name: senderName, Address: senderEmail},
		clientURL:   clientURL,
		queries:     queries,
		conn:        conn,
	}
}
