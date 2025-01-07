package mailing

import "net/mail"

func InitMailingModule(smtpHost, smtpPort, senderName, senderEmail string) {
	MailingServiceSingleton = &MailingService{
		smtpHost:    smtpHost,
		smtpPort:    smtpPort,
		senderEmail: mail.Address{Name: senderName, Address: senderEmail},
	}
}
