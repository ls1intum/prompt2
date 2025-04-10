import { useNavigate, useLocation } from 'react-router-dom'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'

import { useParticipationStore } from '../../zustand/useParticipationStore'

export const AssessmentOverviewPage = (): JSX.Element => {
  const navigate = useNavigate()
  const path = useLocation().pathname

  const { participations } = useParticipationStore()

  return (
    <div>
      <ManagementPageHeader>Assessment Overview</ManagementPageHeader>
      <p className='text-sm text-muted-foregrount mb-4'>
        Click on a participant to view/edit their assessment.
      </p>
      <CoursePhaseParticipationsTablePage
        participants={participations ?? []}
        prevDataKeys={['score']}
        restrictedDataKeys={[]}
        studentReadableDataKeys={[]}
        onClickRowAction={(student) =>
          navigate(`${path}/student-assessment/${student.courseParticipationID}`)
        }
      />
    </div>
  )
}
