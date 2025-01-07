package mailing

import (
	"fmt"
	"net/mail"
	"net/smtp"
	"strings"
)

var senderEmail string
var smtpHost = "127.0.0.1"
var smtpPort = "25"
var mailingName = "Prompt | Chair for Applied Teaching Technologies"
var replyToEmail = "ipraktikum.ase@xcit.tum.de"

// Setup initializes the sender email for the mailing service.
func Setup(email string) {
	senderEmail = email
}

// SendMail sends an email with the specified HTML body, recipient, and subject.
func SendMail(htmlBody, recipient, subject string) error {
	if senderEmail == "" {
		return fmt.Errorf("sender email is not set, call Setup(email) first")
	}

	from := mail.Address{Name: mailingName, Address: senderEmail}
	to := mail.Address{Name: "Recipient", Address: recipient}
	replyTo := mail.Address{Name: mailingName, Address: senderEmail}

	// Build email headers
	header := map[string]string{
		"From":         from.String(),
		"To":           to.String(),
		"Reply-To":     replyTo.String(),
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
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer client.Close()

	// Set the sender and recipient
	if err := client.Mail(senderEmail); err != nil {
		return fmt.Errorf("failed to set sender: %w", err)
	}
	if err := client.Rcpt(recipient); err != nil {
		return fmt.Errorf("failed to set recipient: %w", err)
	}

	// Send the data
	writer, err := client.Data()
	if err != nil {
		return fmt.Errorf("failed to send data: %w", err)
	}
	_, err = writer.Write([]byte(message.String()))
	if err != nil {
		return fmt.Errorf("failed to write message: %w", err)
	}

	if err := writer.Close(); err != nil {
		return fmt.Errorf("failed to close writer: %w", err)
	}

	return client.Quit()
}
