import { useEffect } from 'react'
import { ApplicationMetaData } from '../interfaces/applicationMetaData'
import { CoursePhaseWithMetaData } from '@tumaet/prompt-shared-state'

export const useParseApplicationMetaData = (
  coursePhase: CoursePhaseWithMetaData | undefined,
  setApplicationMetaData: (restrictedData: ApplicationMetaData) => void,
) => {
  return useEffect(() => {
    if (coursePhase) {
      const externalStudentsAllowed = coursePhase?.restrictedData?.['externalStudentsAllowed']
      const applicationStartDate = coursePhase?.restrictedData?.['applicationStartDate']
      const applicationEndDate = coursePhase?.restrictedData?.['applicationEndDate']
      const universityLoginAvailable = coursePhase?.restrictedData?.['universityLoginAvailable']

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
