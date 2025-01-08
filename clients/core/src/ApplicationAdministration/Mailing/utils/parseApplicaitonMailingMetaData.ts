import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'

export const parseApplicationMailingMetaData = (metaData: JSON[]): ApplicationMailingMetaData => {
  const confirmationMail = metaData?.['mailingConfig']?.['confirmationMail']
  const rejectionMail = metaData?.['mailingConfig']?.['rejectionMail']
  const acceptanceMail = metaData?.['mailingConfig']?.['acceptanceMail']
  const sendConfirmationMail = metaData?.['mailingConfig']?.['sendConfirmationMail']
  const sendRejectionMail = metaData?.['mailingConfig']?.['sendRejectionMail']
  const sendAcceptanceMail = metaData?.['mailingConfig']?.['sendAcceptanceMail']

  const parsedMetaData: ApplicationMailingMetaData = {
    confirmationMail: confirmationMail ? confirmationMail : '',
    rejectionMail: rejectionMail ? rejectionMail : '',
    acceptanceMail: acceptanceMail ? acceptanceMail : '',
    sendConfirmationMail: sendConfirmationMail ? sendConfirmationMail : false,
    sendRejectionMail: sendRejectionMail ? sendRejectionMail : false,
    sendAcceptanceMail: sendAcceptanceMail ? sendAcceptanceMail : false,
  }

  return parsedMetaData
}
