import { ApplicationMailingMetaData } from '../../../interfaces/applicationMailingMetaData'

export const parseApplicationMailingMetaData = (metaData: any): ApplicationMailingMetaData => {
  const {
    mailingSettings: {
      confirmationMailSubject = '',
      confirmationMailContent = '',
      failedMailSubject = '',
      failedMailContent = '',
      passedMailSubject = '',
      passedMailContent = '',
      sendConfirmationMail = false,
      sendRejectionMail = false,
      sendAcceptanceMail = false,
    } = {},
  } = metaData || {}

  return {
    confirmationMailSubject,
    confirmationMailContent,
    failedMailSubject,
    failedMailContent,
    passedMailSubject,
    passedMailContent,
    sendConfirmationMail,
    sendRejectionMail,
    sendAcceptanceMail,
  }
}
