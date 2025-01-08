import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'

export const parseApplicationMailingMetaData = (metaData: JSON[]): ApplicationMailingMetaData => {
  const confirmationMailSubject = metaData?.['mailingConfig']?.['confirmationMailSubject']
  const confirmationMail = metaData?.['mailingConfig']?.['confirmationMail']

  const rejectionMailSubject = metaData?.['mailingConfig']?.['rejectionMailSubject']
  const rejectionMail = metaData?.['mailingConfig']?.['rejectionMail']

  const acceptanceMailSubject = metaData?.['mailingConfig']?.['acceptanceMailSubject']
  const acceptanceMail = metaData?.['mailingConfig']?.['acceptanceMail']

  const sendConfirmationMail = metaData?.['mailingConfig']?.['sendConfirmationMail']
  const sendRejectionMail = metaData?.['mailingConfig']?.['sendRejectionMail']
  const sendAcceptanceMail = metaData?.['mailingConfig']?.['sendAcceptanceMail']

  const replyToName = metaData?.['mailingConfig']?.['replyToName']
  const replyToEmail = metaData?.['mailingConfig']?.['replyToEmail']

  const parsedMetaData: ApplicationMailingMetaData = {
    confirmationMailSubject: confirmationMailSubject ? confirmationMailSubject : '',
    confirmationMail: confirmationMail ? confirmationMail : '',

    rejectionMailSubject: rejectionMailSubject ? rejectionMailSubject : '',
    rejectionMail: rejectionMail ? rejectionMail : '',

    acceptanceMailSubject: acceptanceMailSubject ? acceptanceMailSubject : '',
    acceptanceMail: acceptanceMail ? acceptanceMail : '',

    sendConfirmationMail: sendConfirmationMail ? sendConfirmationMail : false,
    sendRejectionMail: sendRejectionMail ? sendRejectionMail : false,
    sendAcceptanceMail: sendAcceptanceMail ? sendAcceptanceMail : false,

    replyToName: replyToName ? replyToName : '',
    replyToEmail: replyToEmail ? replyToEmail : '',
  }

  return parsedMetaData
}
