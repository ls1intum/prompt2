export type ApplicationMailingMetaData = {
  confirmationMailSubject: string
  confirmationMail: string

  rejectionMailSubject: string
  rejectionMail: string

  acceptanceMailSubject: string
  acceptanceMail: string

  sendConfirmationMail: boolean
  sendRejectionMail: boolean
  sendAcceptanceMail: boolean

  replyToName: string
  replyToEmail: string
}
