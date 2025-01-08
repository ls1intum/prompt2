import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'

export function getIsApplicationConfigured(metaData: ApplicationMailingMetaData | null): boolean {
  return metaData &&
    metaData.sendAcceptanceMail !== undefined &&
    metaData.sendConfirmationMail !== undefined &&
    metaData.sendRejectionMail !== undefined
    ? true
    : false
}
