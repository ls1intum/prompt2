export type ApplicationMailingMetaData = {
  confirmationMailSubject: string
  confirmationMailContent: string

  failedMailSubject: string
  failedMailContent: string

  passedMailSubject: string
  passedMailContent: string

  sendConfirmationMail: boolean
  sendRejectionMail: boolean // for automatic mail - not yet implemented
  sendAcceptanceMail: boolean // for automatic mail - not yet implemented
}
