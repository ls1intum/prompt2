import { useEffect } from 'react'
import { ApplicationMetaData } from '../interfaces/applicationMetaData'
import { CoursePhaseWithMetaData } from '@tumaet/prompt-shared-state'

export const useParseApplicationMetaData = (
  coursePhase: CoursePhaseWithMetaData | undefined,
  setApplicationMetaData: (metaData: ApplicationMetaData) => void,
) => {
  return useEffect(() => {
    if (coursePhase) {
      const externalStudentsAllowed = coursePhase?.metaData?.['externalStudentsAllowed']
      const applicationStartDate = coursePhase?.metaData?.['applicationStartDate']
      const applicationEndDate = coursePhase?.metaData?.['applicationEndDate']
      const universityLoginAvailable = coursePhase?.metaData?.['universityLoginAvailable']

      const parsedMetaData: ApplicationMetaData = {
        applicationStartDate: applicationStartDate ? new Date(applicationStartDate) : undefined,
        applicationEndDate: applicationEndDate ? new Date(applicationEndDate) : undefined,
        externalStudentsAllowed: externalStudentsAllowed ? externalStudentsAllowed : false,
        universityLoginAvailable: universityLoginAvailable ? universityLoginAvailable : false,
      }
      setApplicationMetaData(parsedMetaData)
    }
  }, [coursePhase, setApplicationMetaData])
}
