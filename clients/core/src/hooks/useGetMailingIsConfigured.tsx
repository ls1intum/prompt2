import { useCourseStore } from '@/zustand/useCourseStore'
import { useParams } from 'react-router-dom'
import { MailingMetaData } from 'src/MailingConfig/interfaces/MailingMetaData'

export const useGetMailingIsConfigured = (): boolean => {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const activeCourse = courses.find((course) => course.id === courseId)

  const mailingConfig = activeCourse?.meta_data?.mailingMetaConfiguration as MailingMetaData
  console.log('mailingConfig', mailingConfig)

  if (
    mailingConfig !== undefined &&
    mailingConfig?.replyToEmail !== '' &&
    mailingConfig?.replyToName !== ''
  ) {
    return true
  } else {
    return false
  }
}
