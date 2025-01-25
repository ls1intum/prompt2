import { PassStatus } from '@tumaet/prompt-shared-state'

export const getStatusColor = (assessmentStatus: PassStatus) => {
  switch (assessmentStatus) {
    case PassStatus.PASSED:
      return 'bg-green-500 dark:bg-green-700'
    case PassStatus.FAILED:
      return 'bg-red-500 dark:bg-red-700'
    case PassStatus.NOT_ASSESSED:
    default:
      return 'bg-gray-500 dark:bg-gray-700'
  }
}
