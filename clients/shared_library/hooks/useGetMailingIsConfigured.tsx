import { useCourseStore, CourseMailingSettings } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'

export const useGetMailingIsConfigured = (): boolean => {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const activeCourse = courses.find((course) => course.id === courseId)

  const mailingSettings = activeCourse?.restrictedData?.mailingSettings as CourseMailingSettings

  if (
    mailingSettings !== undefined &&
    mailingSettings?.replyToEmail !== '' &&
    mailingSettings?.replyToName !== ''
  ) {
    return true
  } else {
    return false
  }
}
