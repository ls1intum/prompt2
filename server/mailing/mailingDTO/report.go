package mailingDTO

type MailingReport struct {
	SuccessfulEmails []string `json:"successful_emails"`
	FailedEmails     []string `json:"failed_emails"`
}
