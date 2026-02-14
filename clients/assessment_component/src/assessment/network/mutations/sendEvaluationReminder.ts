import { axiosInstance } from '@/network/configService'
import {
  SendEvaluationReminderRequest,
  EvaluationReminderReport,
} from '../../interfaces/evaluationReminder'

export const sendEvaluationReminder = async (
  coursePhaseID: string,
  request: SendEvaluationReminderRequest,
): Promise<EvaluationReminderReport> => {
  try {
    return (
      await axiosInstance.post(`/api/mailing/${coursePhaseID}/evaluation-reminder`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).data
  } catch (err) {
    console.error('Failed to send evaluation reminder:', err)
    throw err
  }
}
