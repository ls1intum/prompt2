import { isAfter, isBefore, isWithinInterval } from 'date-fns'
import { ApplicationMetaData } from '../interfaces/ApplicationMetaData'
import { ApplicationStatus } from '../interfaces/ApplicationStatus'

export const getApplicationStatus = (
  applicationMetaData: ApplicationMetaData | null,
  applicationPhaseIsConfigured: boolean,
) => {
  if (!applicationMetaData) return ApplicationStatus.Unknown
  if (!applicationPhaseIsConfigured) return ApplicationStatus.NotConfigured
  const now = new Date()
  if (isBefore(now, applicationMetaData.applicationStartDate!)) return ApplicationStatus.NotYetLive
  if (isAfter(now, applicationMetaData.applicationEndDate!)) return ApplicationStatus.Passed
  if (
    isWithinInterval(now, {
      start: applicationMetaData.applicationStartDate!,
      end: applicationMetaData.applicationEndDate!,
    })
  )
    return ApplicationStatus.Live
  return ApplicationStatus.Unknown
}
