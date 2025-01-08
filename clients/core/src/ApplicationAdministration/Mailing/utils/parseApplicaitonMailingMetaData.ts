import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'

export const parseApplicationMailingMetaData = (metaData: JSON[]): ApplicationMailingMetaData => {
  const confirmationMail = metaData?.['confirmationMail']
  const rejectionMail = metaData?.['rejectionMail']
  const acceptanceMail = metaData?.['acceptanceMail']
  const sendConfirmationMail = metaData?.['sendConfirmationMail']
  const sendRejectionMail = metaData?.['sendRejectionMail']
  const sendAcceptanceMail = metaData?.['sendAcceptanceMail']

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
