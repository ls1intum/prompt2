import { axiosInstance } from '../configService'
import { SendStatusMail } from '@/interfaces/send_status_mail'
import { MailingReport } from '@/interfaces/mailing_report'

export const sendStatusMail = async (
  coursePhaseID: string,
  status: SendStatusMail,
): Promise<MailingReport> => {
  try {
    return (
      await axiosInstance.put(`/api/mailing/${coursePhaseID}`, status, {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      })
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
