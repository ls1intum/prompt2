import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'

export const parseApplicationMailingMetaData = (metaData: any): ApplicationMailingMetaData => {
  const {
    mailingConfig: {
      confirmationMailSubject = '',
      confirmationMail = '',
      rejectionMailSubject = '',
      rejectionMail = '',
      acceptanceMailSubject = '',
      acceptanceMail = '',
      sendConfirmationMail = false,
      sendRejectionMail = false,
      sendAcceptanceMail = false,
      replyToName = '',
      replyToEmail = '',
    } = {},
  } = metaData || {}

  return {
    confirmationMailSubject,
    confirmationMail,
    rejectionMailSubject,
    rejectionMail,
    acceptanceMailSubject,
    acceptanceMail,
    sendConfirmationMail,
    sendRejectionMail,
    sendAcceptanceMail,
    replyToName,
    replyToEmail,
  }
}
