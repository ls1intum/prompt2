import { useCourseStore } from '@/zustand/useCourseStore'
import { useParams } from 'react-router-dom'
import { MailingMetaData } from '../MailingConfig/interfaces/MailingMetaData'

export const useGetMailingIsConfigured = (): boolean => {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const activeCourse = courses.find((course) => course.id === courseId)

  const mailingSettings = activeCourse?.metaData?.mailingSettings as MailingMetaData

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
