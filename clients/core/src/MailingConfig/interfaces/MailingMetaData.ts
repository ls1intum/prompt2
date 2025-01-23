export interface MailingMetaData {
  replyToName?: string
  replyToEmail?: string
  ccAddresses?: { name?: string; email: string }[]
  bccAddresses?: { name?: string; email: string }[]
}
