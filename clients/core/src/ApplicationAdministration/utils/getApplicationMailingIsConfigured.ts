import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'

export function getIsApplicationMailingIsConfigured(
  metaData: ApplicationMailingMetaData | null,
): boolean {
  return metaData && metaData.replyToEmail !== '' && metaData.replyToName !== '' ? true : false
}
