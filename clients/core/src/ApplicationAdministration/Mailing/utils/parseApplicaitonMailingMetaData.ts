import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'

export const parseApplicationMailingMetaData = (metaData: JSON[]): ApplicationMailingMetaData => {
  const confirmationMail = metaData?.['mailingConfig']?.['confirmationMail']
  const rejectionMail = metaData?.['mailingConfig']?.['rejectionMail']
  const acceptanceMail = metaData?.['mailingConfig']?.['acceptanceMail']
  const sendConfirmationMail = metaData?.['mailingConfig']?.['sendConfirmationMail']
  const sendRejectionMail = metaData?.['mailingConfig']?.['sendRejectionMail']
  const sendAcceptanceMail = metaData?.['mailingConfig']?.['sendAcceptanceMail']

  const parsedMetaData: ApplicationMailingMetaData = {
    confirmationMail: confirmationMail ? confirmationMail : undefined,
    rejectionMail: rejectionMail ? rejectionMail : undefined,
    acceptanceMail: acceptanceMail ? acceptanceMail : undefined,
    sendConfirmationMail: sendConfirmationMail ? sendConfirmationMail : undefined,
    sendRejectionMail: sendRejectionMail ? sendRejectionMail : undefined,
    sendAcceptanceMail: sendAcceptanceMail ? sendAcceptanceMail : undefined,
  }

  return parsedMetaData
}
