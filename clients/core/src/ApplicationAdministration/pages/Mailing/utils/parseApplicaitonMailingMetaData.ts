import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'

export const parseApplicationMailingMetaData = (metaData: any): ApplicationMailingMetaData => {
  const {
    mailingConfig: {
      confirmationMailSubject = '',
      confirmationMailContent = '',
      failedMailSubject = '',
      failedMailContent = '',
      passedMailSubject = '',
      passedMailContent = '',
      sendConfirmationMail = false,
      sendRejectionMail = false,
      sendAcceptanceMail = false,
      replyToName = '',
      replyToEmail = '',
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
    replyToName,
    replyToEmail,
  }
}
