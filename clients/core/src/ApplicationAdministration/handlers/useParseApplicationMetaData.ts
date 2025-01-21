import { useEffect } from 'react'
import { ApplicationMetaData } from '../interfaces/ApplicationMetaData'
import { CoursePhaseWithMetaData } from '@/interfaces/course_phase'

export const useParseApplicationMetaData = (
  coursePhase: CoursePhaseWithMetaData | undefined,
  setApplicationMetaData: (metaData: ApplicationMetaData) => void,
) => {
  return useEffect(() => {
    if (coursePhase) {
      const externalStudentsAllowed = coursePhase?.meta_data?.['externalStudentsAllowed']
      const applicationStartDate = coursePhase?.meta_data?.['applicationStartDate']
      const applicationEndDate = coursePhase?.meta_data?.['applicationEndDate']
      const universityLoginAvailable = coursePhase?.meta_data?.['universityLoginAvailable']

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
