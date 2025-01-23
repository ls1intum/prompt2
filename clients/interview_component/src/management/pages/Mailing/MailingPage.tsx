import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { CoursePhaseMailing } from '@/components/pages/Mailing/CoursePhaseMailing'
import { useCoursePhaseStore } from '../../zustand/useCoursePhaseStore'

export const MailingPage = (): JSX.Element => {
  const { coursePhase } = useCoursePhaseStore()
  return (
    <>
      <ManagementPageHeader>Mailing</ManagementPageHeader>
      <CoursePhaseMailing coursePhase={coursePhase} />
    </>
  )
}
