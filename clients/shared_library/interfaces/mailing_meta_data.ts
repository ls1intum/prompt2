export type ApplicationMailingMetaData = {
  confirmationMailSubject: string
  confirmationMailContent: string

  failedMailSubject: string
  failedMailContent: string

  passedMailSubject: string
  passedMailContent: string

  sendConfirmationMail: boolean
  sendRejectionMail: boolean
  sendAcceptanceMail: boolean

  replyToName: string
  replyToEmail: string
}
