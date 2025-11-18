import { CheckCircle, XCircle } from 'lucide-react'
import { ActionOnParticipants } from '../../../interfaces/ActionOnParticipants'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { useUpdateCoursePhaseParticipationBatch } from '@/hooks/useUpdateCoursePhaseParticipationBatch'

export const useDefaultParticipantActions = (phaseId: string) => {
  const { mutate: mutateUpdate } = useUpdateCoursePhaseParticipationBatch()

  const actionSetPassStatus = (targetPassStatus: PassStatus, rows: string[]) => {
    const mutations = rows.map((row) => ({
      coursePhaseID: phaseId,
      courseParticipationID: row,
      passStatus: targetPassStatus,
      restrictedData: {},
      studentReadableData: {},
    }))
    mutateUpdate(mutations)
  }

  return [
    {
      label: 'Set Passed',
      icon: <CheckCircle className='mr-2 h-4 w-4' />,
      singleRecordOnly: false,
      confirm: {
        title: 'Confirm Set Passed',
        description: (count: number) =>
          `Are you sure you want to mark ${count} participants as passed?`,
        confirmLabel: 'Set Passed',
      },
      onAction: (rows: string[]) => actionSetPassStatus(PassStatus.PASSED, rows),
    },
    {
      label: 'Set Failed',
      icon: <XCircle className='mr-2 h-4 w-4' />,
      singleRecordOnly: false,
      confirm: {
        title: 'Confirm Set Failed',
        description: (count: number) =>
          `Are you sure you want to mark ${count} participants as failed?`,
        confirmLabel: 'Set Failed',
      },
      onAction: (rows: string[]) => actionSetPassStatus(PassStatus.FAILED, rows),
    },
  ] satisfies ActionOnParticipants[]
}
