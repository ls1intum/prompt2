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
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/mailing/mailingDTO"
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

func SendApplicationConfirmationMail(ctx context.Context, coursePhaseID, courseParticipationID uuid.UUID) (bool, error) {
	isApplicationPhase, err := MailingServiceSingleton.queries.CheckIfCoursePhaseIsApplicationPhase(ctx, coursePhaseID)
	if err != nil {
		return false, err
	}
	if !isApplicationPhase {
		return false, errors.New("course phase is not an application phase")
	}

	mailingInfo, err := MailingServiceSingleton.queries.GetConfirmationMailingInformation(ctx, db.GetConfirmationMailingInformationParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})

	if err != nil {
		log.Error("failed to get mailing information: ", err)
		return false, errors.New("failed to send mail")
	}

	if !mailingInfo.SendConfirmationMail {
		log.Debug("not sending because SendConfirmationMail is disabled")
		return false, nil
	}

	if mailingInfo.ConfirmationMailContent == "" {
		log.Error("mailing template is not correctly configured")
		return false, nil
	}

	courseMailingSettings, err := getSenderInformation(ctx, coursePhaseID)
	if err != nil {
		log.Error("failed to get sender information")
		return false, err
	}

	log.Info("Sending confirmation mail to ", mailingInfo.Email.String)

	applicationURL := fmt.Sprintf("%s/apply/%s", MailingServiceSingleton.clientURL, coursePhaseID.String())
	placeholderValues := getApplicationConfirmationPlaceholderValues(mailingInfo, applicationURL)
	finalMessage := replacePlaceholders(mailingInfo.ConfirmationMailContent, placeholderValues)

	// replace values in subject
	finalSubject := replacePlaceholders(mailingInfo.ConfirmationMailSubject, placeholderValues)

	err = SendMail(courseMailingSettings, mailingInfo.Email.String, finalSubject, finalMessage)
	if err != nil {
		log.Error("failed to send mail: ", err)
		return false, errors.New("failed to send mail")
	}

	return true, nil
}

func SendStatusMailManualTrigger(ctx context.Context, coursePhaseID uuid.UUID, status db.PassStatus) (mailingDTO.MailingReport, error) {
	response := mailingDTO.MailingReport{}
	mailingInfo := mailingDTO.MailingInfo{}

	// 1.) get mailing info for course phase
	if status == db.PassStatusPassed {
		infos, err := MailingServiceSingleton.queries.GetPassedMailingInformation(ctx, coursePhaseID)
		if err != nil {
			log.Error("failed to get mailing information: ", err)
			return mailingDTO.MailingReport{}, errors.New("failed to send mail")
		}
		mailingInfo = mailingDTO.GetMailingInfoFromPassedMailingInformation(infos)

	} else if status == db.PassStatusFailed {
		infos, err := MailingServiceSingleton.queries.GetFailedMailingInformation(ctx, coursePhaseID)
		if err != nil {
			log.Error("failed to get mailing information: ", err)
			return mailingDTO.MailingReport{}, errors.New("failed to send mail")
		}
		mailingInfo = mailingDTO.GetMailingInfoFromFailedMailingInformation(infos)

	} else {
		log.Error("invalid status")
		return mailingDTO.MailingReport{}, errors.New("failed to send mail")

	}

	// Get the course mailing settings
	courseMailingSettings, err := getSenderInformation(ctx, coursePhaseID)
	if err != nil {
		log.Error("failed to get sender information")
		return mailingDTO.MailingReport{}, err
	}

	// 2.) Check if mailing is configured -> return if not
	if mailingInfo.MailSubject == "" || mailingInfo.MailContent == "" {
		log.Error("mailing template is not correctly configured")
		return mailingDTO.MailingReport{}, errors.New("failed to send mail")
	}

	// 3.) Get all participants that have not been accepted incl. information
	participants, err := MailingServiceSingleton.queries.GetParticipantMailingInformation(ctx, db.GetParticipantMailingInformationParams{
		ID:         coursePhaseID,
		PassStatus: db.NullPassStatus{PassStatus: status, Valid: true},
	})
	if err != nil {
		log.Error("failed to get participant mailing information: ", err)
		return mailingDTO.MailingReport{}, errors.New("failed to send mail")
	}

	// 4.) Send mail to all participants
	for _, participant := range participants {
		placeholderMap := getStatusEmailPlaceholderValues(mailingInfo.CourseName, mailingInfo.CourseStartDate, mailingInfo.CourseEndDate, participant)
		// replace values in subject
		finalSubject := replacePlaceholders(mailingInfo.MailSubject, placeholderMap)

		// replace values in content
		finalMessage := replacePlaceholders(mailingInfo.MailContent, placeholderMap)

		err = SendMail(courseMailingSettings, participant.Email.String, finalSubject, finalMessage)
		if err != nil {
			log.Error("failed to send mail: ", err)
			response.FailedEmails = append(response.FailedEmails, participant.Email.String)
		} else {
			response.SuccessfulEmails = append(response.SuccessfulEmails, participant.Email.String)
		}
	}

	return response, nil
}

// SendMail sends an email with the specified HTML body, recipient, and subject.
func SendMail(courseMailingSettings mailingDTO.CourseMailingSettings, recipientAddress, subject, htmlBody string) error {
	if MailingServiceSingleton.senderEmail.Address == "" ||
		recipientAddress == "" ||
		subject == "" ||
		htmlBody == "" {
		return fmt.Errorf("mailing is not correctly configured")
	}

	to := mail.Address{Address: recipientAddress}

	var message strings.Builder
	buildMailHeader(&message, courseMailingSettings, to.String(), subject)
	message.WriteString(htmlBody)

	// Send the email
	addr := fmt.Sprintf("%s:%s", MailingServiceSingleton.smtpHost, MailingServiceSingleton.smtpPort)
	client, err := smtp.Dial(addr)
	if err != nil {
		log.Error("failed to connect to SMTP server: ", err.Error())
		return errors.New("failed to send mail")
	}
	defer client.Close()

	// Set the sender and recipient
	if err := client.Mail(MailingServiceSingleton.senderEmail.Address); err != nil {
		log.Error("failed to set sender: ", err)
		return errors.New("failed to send mail")
	}

	if err := client.Rcpt(recipientAddress); err != nil {
		log.Error("failed to set recipient: ", err)
		return errors.New("failed to send mail")
	}

	// set all cc mails
	for _, cc := range courseMailingSettings.CC {
		if err := client.Rcpt(cc.Address); err != nil {
			log.Error("failed to set cc: ", err)
			return errors.New("failed to send mail")
		}
	}

	// set all bcc mails
	for _, bcc := range courseMailingSettings.BCC {
		if err := client.Rcpt(bcc.Address); err != nil {
			log.Error("failed to set bcc: ", err)
			return errors.New("failed to send mail")
		}
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

func getSenderInformation(ctx context.Context, coursePhaseID uuid.UUID) (mailingDTO.CourseMailingSettings, error) {
	courseMailing, err := MailingServiceSingleton.queries.GetCourseMailingSettingsForCoursePhaseID(ctx, coursePhaseID)
	if err != nil {
		log.Error("failed to get course mailing settings: ", err)
		return mailingDTO.CourseMailingSettings{}, errors.New("failed to get course mailing infos")
	}

	if courseMailing.ReplyToEmail == "" || courseMailing.ReplyToName == "" {
		log.Error("reply to email or name is not set")
		return mailingDTO.CourseMailingSettings{}, errors.New("reply to email or name is not set")
	}

	courseMailingSettings, err := mailingDTO.GetCourseMailingSettingsFromDBModel(courseMailing)
	if err != nil {
		log.Error("failed to get course mailing settings: ", err)
		return mailingDTO.CourseMailingSettings{}, errors.New("failed to get course mailing infos")
	}

	return courseMailingSettings, nil

}

func buildMailHeader(message *strings.Builder, courseMailingSettings mailingDTO.CourseMailingSettings, recipient, subject string) {
	// using this instead of map to geth a nicely formatted Mailing Header
	message.WriteString(fmt.Sprintf("From: %s\r\n", MailingServiceSingleton.senderEmail.String()))
	message.WriteString(fmt.Sprintf("To: %s\r\n", recipient))
	message.WriteString(fmt.Sprintf("Reply-To: %s\r\n", courseMailingSettings.ReplyTo.String()))
	message.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	message.WriteString("MIME-Version: 1.0\r\n") // Improve Spam Score by setting explicit MIME-Version
	message.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")

	if len(courseMailingSettings.CC) > 0 {
		var ccString string
		for _, cc := range courseMailingSettings.CC {
			ccString += cc.String() + ","
		}
		message.WriteString(fmt.Sprintf("CC: %s\r\n", ccString))
	}

	// BCC are set in the client and not the header
	message.WriteString("\r\n")
}
