import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { CoursePhaseMailing } from '@/components/pages/Mailing/CoursePhaseMailing'
import { useCoursePhaseStore } from '../../zustand/useCoursePhaseStore'

export const MailingPage = (): JSX.Element => {
  const { coursePhase } = useCoursePhaseStore()
  return (
    <div>
      <ManagementPageHeader>Mailing</ManagementPageHeader>
      <CoursePhaseMailing coursePhase={coursePhase} />
    </div>
  )
}
