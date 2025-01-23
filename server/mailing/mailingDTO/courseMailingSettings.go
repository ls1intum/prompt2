package mailingDTO

import "net/mail"

type CourseMailingSettings struct {
	ReplyTo mail.Address
	CC      mail.Address
	BCC     mail.Address
}
