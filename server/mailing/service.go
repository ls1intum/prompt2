package mailing

import (
	"errors"
	"fmt"
	"net/mail"
	"net/smtp"
	"strings"

	log "github.com/sirupsen/logrus"
)

type MailingService struct {
	smtpHost     string
	smtpPort     string
	senderEmail  mail.Address
	replyToEmail mail.Address
}

var MailingServiceSingleton *MailingService

// SendMail sends an email with the specified HTML body, recipient, and subject.
func SendMail(htmlBody, recipientAddress, subject string) error {
	if MailingServiceSingleton.senderEmail.Address == "" {
		return fmt.Errorf("sender email is not set, Setup the MailingService first")
	}

	to := mail.Address{Address: recipientAddress}

	// Build email headers
	header := map[string]string{
		"From":         MailingServiceSingleton.senderEmail.String(),
		"To":           to.String(),
		"Reply-To":     MailingServiceSingleton.replyToEmail.String(),
		"Subject":      subject,
		"Content-Type": `text/html; charset="UTF-8"`,
	}

	// Construct the message
	var message strings.Builder
	for k, v := range header {
		message.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	message.WriteString("\r\n")
	message.WriteString(htmlBody)

	// Send the email
	addr := fmt.Sprintf("%s:%s", MailingServiceSingleton.smtpHost, MailingServiceSingleton.smtpPort)
	client, err := smtp.Dial(addr)
	if err != nil {
		log.Error("failed to connect to SMTP server: ", err.Error())
		return errors.New("failed to send mail")
	}
	defer client.Close()

	log.Info(MailingServiceSingleton.senderEmail.Address)

	// Set the sender and recipient
	if err := client.Mail(MailingServiceSingleton.senderEmail.Address); err != nil {
		log.Error("failed to set sender: ", err)
		return errors.New("failed to send mail")
	}
	if err := client.Rcpt(recipientAddress); err != nil {
		log.Error("failed to set recipient: ", err)
		return errors.New("failed to send mail")
	}

	// Send the data
	writer, err := client.Data()
	if err != nil {
		log.Error("failed to send data: ", err)
		return errors.New("failed to send mail")
	}
	_, err = writer.Write([]byte(message.String()))
	if err != nil {
		log.Error("failed to write message: ", err)
		return errors.New("failed to send mail")
	}

	if err := writer.Close(); err != nil {
		log.Error("failed to close writer: ", err)
		return errors.New("failed to send mail")
	}

	return client.Quit()
}
