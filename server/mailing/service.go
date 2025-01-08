package mailing

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"net/smtp"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type MailingService struct {
	smtpHost    string
	smtpPort    string
	senderEmail mail.Address
	clientURL   string
	queries     db.Queries
	conn        *pgxpool.Pool
}

var MailingServiceSingleton *MailingService

func SendApplicationConfirmationMail(ctx context.Context, coursePhaseID, coursePhaseParticipationID uuid.UUID) error {
	isApplicationPhase, err := MailingServiceSingleton.queries.CheckIfCoursePhaseIsApplicationPhase(ctx, coursePhaseID)
	if err != nil {
		return err
	}
	if !isApplicationPhase {
		return errors.New("course phase is not an application phase")
	}

	mailingInfo, err := MailingServiceSingleton.queries.GetConfirmationMailingInformation(ctx, db.GetConfirmationMailingInformationParams{
		ID:            coursePhaseParticipationID,
		CoursePhaseID: coursePhaseID,
	})
	if err != nil {
		log.Error("failed to get mailing information: ", err)
		return errors.New("failed to send mail")
	}

	if !mailingInfo.SendConfirmationMail {
		log.Debug("not sending because SendConfirmationMail is disabled")
		return nil
	}

	if mailingInfo.ConfirmationMailTemplate == "" {
		log.Error("mailing template is not correctly configured")
		return nil
	}

	log.Info("Sending confirmation mail to ", mailingInfo.Email.String)

	applicationURL := fmt.Sprintf("%s/apply/%s", MailingServiceSingleton.clientURL, coursePhaseParticipationID.String())
	placeholderValues := getPlaceholderValues(mailingInfo, applicationURL)
	finalMessage := replacePlaceholders(mailingInfo.ConfirmationMailTemplate, placeholderValues)

	// replace values in subject
	finalSubject := replacePlaceholders(mailingInfo.ConfirmationMailSubject, placeholderValues)

	// TODO replace with with subject
	err = SendMail(mailingInfo.Email.String, mailingInfo.ReplyToEmail, mailingInfo.ReplyToName, finalSubject, finalMessage)
	if err != nil {
		log.Error("failed to send mail: ", err)
		return errors.New("failed to send mail")
	}

	return nil
}

// SendMail sends an email with the specified HTML body, recipient, and subject.
func SendMail(recipientAddress, replyToAddress, replyToName, subject, htmlBody string) error {
	if MailingServiceSingleton.senderEmail.Address == "" ||
		recipientAddress == "" ||
		replyToAddress == "" ||
		subject == "" ||
		htmlBody == "" {
		return fmt.Errorf("mailing is not correctly configured")
	}

	to := mail.Address{Address: recipientAddress}
	replyToEmail := mail.Address{Name: replyToName, Address: replyToAddress}

	// Build email headers
	header := map[string]string{
		"From":         MailingServiceSingleton.senderEmail.String(),
		"To":           to.String(),
		"Reply-To":     replyToEmail.String(),
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

	log.Debug(MailingServiceSingleton.senderEmail.Address)

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
